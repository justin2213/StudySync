import { query, handleDatabaseError } from '../utils/client.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import dayjs from 'dayjs';

/**
 * Retrieve all non-class tasks (events) for a specific user, with optional
 * class and semester info if the task is tied to a class.
 *
 * Steps performed:
 *   1. Validates that `req.params.userID` is provided.
 *   2. Queries the `Events` table for all rows where:
 *        - `UserID = userID`
 *        - `EventType <> 'class'`
 *   3. For each event row:
 *        a. If `classID` is non-null:
 *           i.   Fetch the class’s `ClassName` and `SemesterID` from `Classes`.
 *           ii.  Fetch the `SemesterName` from `Semesters` using that `SemesterID`.
 *           iii. Populate `className` and `semesterName` fields.
 *        b. Determine:
 *           - `isEstimated`: `scheduledEndTime === null`
 *           - `isDeadline`:  `scheduledEndTime !== null && duration === 0`
 *   4. Formats each task as:
 *        {
 *          taskID,           // eventID
 *          taskName,         // title
 *          taskDescription,  // description
 *          taskType,         // eventType
 *          isDeadline,       // boolean
 *          isEstimated,      // boolean
 *          duration,         // in minutes
 *          taskStart,        // ScheduledStartTime (timestamp)
 *          taskEnd,          // ScheduledEndTime (timestamp|null)
 *          className,        // string|null
 *          semesterName,     // string|null
 *          completed         // boolean
 *        }
 *   5. Returns HTTP 200 with `{ tasks: [...] }`.
 *
 * Error handling:
 *   - 400 Bad Request if `userID` is missing.
 *   - Delegates any other errors to `handleDatabaseError`.
 *
 * @param {import('express').Request} req
 *   - req.params.userID: {string} the ID of the user whose tasks to retrieve.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP 200 with tasks list, or error response.
 */
export const getTasks = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!userID) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch all non-class events for this user
    const getTasksQuery = `
      SELECT *
      FROM Events
      WHERE UserID = $1
        AND EventType <> 'class'
    `;
    const result = await query(getTasksQuery, [userID]);

    // Enrich each event with optional class/semester info and computed flags
    const formattedTasks = await Promise.all(
      result.rows.map(async (row) => {
        let classInfo = null;

        if (row.classid !== null) {
          // Fetch ClassName and SemesterID
          const getClassQuery = `
            SELECT SemesterID, ClassName
            FROM Classes
            WHERE ClassID = $1
          `;
          const classResult = await query(getClassQuery, [row.classid]);

          if (classResult.rows.length > 0) {
            const { semesterid, classname } = classResult.rows[0];

            // Fetch SemesterName
            const getSemesterQuery = `
              SELECT SemesterName
              FROM Semesters
              WHERE SemesterID = $1
            `;
            const semesterResult = await query(getSemesterQuery, [semesterid]);
            const semesterName = semesterResult.rows[0]?.semestername || null;

            classInfo = { className: classname, semesterName };
          }
        }

        const isEstimated = row.scheduledendtime === null;
        const isDeadline  = row.scheduledendtime !== null && row.duration === 0;

        return {
          taskID:        row.eventid,
          taskName:      row.title,
          taskDescription: row.description,
          taskType:      row.eventtype,
          isDeadline,
          isEstimated,
          duration:      row.duration,
          taskStart:     row.scheduledstarttime,
          taskEnd:       row.scheduledendtime,
          className:     classInfo?.className || null,
          semesterName:  classInfo?.semesterName || null,
          completed:     row.completed,
        };
      })
    );

    return res.status(200).json({ tasks: formattedTasks });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Create a new task/event for a user.
 *
 * Expects `req.body` to contain:
 *   - userID:          {string}   ID of the user creating the task (required)
 *   - taskName:        {string}   Title of the task (required)
 *   - taskDescription: {string}   Detailed description (optional)
 *   - taskType:        {string}   Type of event (e.g. 'homework', 'meeting') (required)
 *   - taskStart:       {string|Date} ISO date/time for when the task begins (optional – will be parsed via Day.js)
 *   - taskEnd:         {string|Date} ISO date/time for when the task ends (optional – will be parsed via Day.js)
 *   - isEstimated:     {boolean}  If true, use `estimatedTime` to set duration and compute end time (optional)
 *   - estimatedTime:   {number|string} Minutes of estimated duration (required if `isEstimated`)
 *   - isDeadline:      {boolean}  If true, represents a deadline—no start time, duration = 0 (optional)
 *   - taskClass:       {string}   ClassID to associate this task with a class (optional)
 *
 * Behavior:
 *   1. Assigns a new UUID for `EventID`.
 *   2. Parses `taskStart` and `taskEnd` into ISO timestamps (or null if invalid/missing).
 *   3. Branches on flags:
 *        • If `isEstimated`, parses `estimatedTime`, sets `duration`, and computes `taskEnd` = `taskStart` + `duration`.
 *        • Else if `isDeadline`, sets `duration = 0` and clears `taskStart`.
 *        • Else (neither), if both `taskStart` & `taskEnd` provided, computes `duration` = difference in minutes.
 *   4. Defaults any `NaN` duration to 0.
 *   5. Inserts a new row into `Events` with:
 *        (EventID, UserID, Title, Description, EventType,
 *         ScheduledStartTime, ScheduledEndTime, Duration, ClassID)
 *   6. Returns HTTP 201 with:
 *        { message: "Task created successfully", task: <inserted row> }
 *
 * Error handling:
 *   - Missing or invalid date formats simply yield `null` timestamps.
 *   - Any DB errors are passed to `handleDatabaseError` (500 response).
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {Promise<import('express').Response>} HTTP response
 */
export const createTask = async (req, res) => {
  try {
    const taskID = uuidv4();
    const task = req.body;

    // Parse start/end into ISO or null
    let taskStart = task.taskStart && dayjs(task.taskStart).isValid()
      ? dayjs(task.taskStart).toISOString()
      : null;
    let taskEnd   = task.taskEnd   && dayjs(task.taskEnd).isValid()
      ? dayjs(task.taskEnd).toISOString()
      : null;

    let duration;

    if (task.isEstimated) {
      // Estimated-duration task
      duration = parseInt(task.estimatedTime, 10) || 0;
      taskEnd = taskStart
        ? dayjs(taskStart).add(duration, 'minute').toISOString()
        : null;
    } else if (task.isDeadline) {
      // Deadline-only task
      duration  = 0;
      taskStart = null;
    } else {
      // Both start & end provided → compute duration
      if (taskStart && taskEnd) {
        duration = Math.round(
          dayjs(taskEnd).diff(dayjs(taskStart), 'minute', true)
        );
      }
    }

    // Fallback for NaN
    if (isNaN(duration)) {
      duration = 0;
    }

    // Insert into Events
    const insertTaskQuery = `
      INSERT INTO Events (
        EventID,
        UserID,
        Title,
        Description,
        EventType,
        ScheduledStartTime,
        ScheduledEndTime,
        Duration,
        ClassID
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;
    const values = [
      taskID,
      task.userID,
      task.taskName,
      task.taskDescription,
      task.taskType,
      taskStart,
      taskEnd,
      duration,
      task.taskClass
    ];
    const result = await query(insertTaskQuery, values);

    return res
      .status(201)
      .json({ message: 'Task created successfully', task: result.rows[0] });

  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Delete multiple tasks (events) by their IDs.
 *
 * Expects `req.body` to contain:
 *   - taskIDs: {string[]} Array of EventID UUIDs to delete (required, non-empty)
 *
 * Behavior:
 *   1. Validates that `taskIDs` is a non-empty array.
 *   2. Executes a single SQL DELETE against `Events`:
 *        DELETE FROM Events WHERE EventID = ANY($1::uuid[])
 *   3. Returns HTTP 200 with `{ message: "Tasks deleted successfully." }` on success.
 *
 * Error cases:
 *   - 400 Bad Request if `taskIDs` is missing or empty.
 *   - Any database/server errors are passed to `handleDatabaseError` (resulting in a 5xx response).
 *
 * @param {import('express').Request} req  
 *   - req.body.taskIDs: {string[]} UUIDs of the tasks to delete.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP response indicating success or error.
 */
export const deleteTasks = async (req, res) => {
  try {
    const taskIDs = req.body.taskIDs;

    // Validate that taskIDs is a non-empty array
    if (!Array.isArray(taskIDs) || taskIDs.length === 0) {
      return res.status(400).json({ error: "No tasks provided for deletion." });
    }

    // Delete all matching events
    const deleteQuery = `
      DELETE FROM Events
      WHERE EventID = ANY($1::uuid[])
    `;
    await query(deleteQuery, [taskIDs]);

    return res.status(200).json({ message: "Tasks deleted successfully." });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Retrieve all events for a user formatted for calendar display,
 * including optional class and semester metadata and computed flags.
 *
 * Steps performed:
 *   1. Validates that `req.params.userID` is provided.
 *   2. Queries the `Events` table for all rows where `UserID = userID`.
 *   3. For each event row:
 *        a. If `classID` is non-null:
 *           i.   Fetch `ClassName` and `SemesterID` from `Classes`.
 *           ii.  Fetch `SemesterName` from `Semesters`.
 *           iii. Collect `classID`, `classTitle`, `semesterID`, `semesterName`.
 *        b. Determine:
 *           - `isEstimated`: `scheduledEndTime === null`
 *           - `isDeadline`:  `scheduledEndTime !== null && duration === 0`
 *        c. Format `duration` (minutes) to `"HH:mm"`.
 *        d. Compute `completed`:
 *           - If `eventType === 'class'` and `scheduledStartTime` is before now, force `true`.
 *   4. Returns HTTP 200 with `{ events: [...] }`.
 *
 * Error handling:
 *   - 400 Bad Request if `userID` is missing.
 *   - Delegates any other errors to `handleDatabaseError`.
 *
 * @param {import('express').Request} req
 *   - req.params.userID: {string} the ID of the user whose events to retrieve.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP 200 with formatted events or error.
 */
export const getEventsForCalendar = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!userID) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch all events for this user
    const getEventsQuery = `
      SELECT * FROM Events
      WHERE UserID = $1
    `;
    const result = await query(getEventsQuery, [userID]);

    // Enrich and format each event
    const formattedEvents = await Promise.all(
      result.rows.map(async (row) => {
        let classInfo = null;

        if (row.classid !== null) {
          // Get class metadata
          const getClassQuery = `
            SELECT SemesterID, ClassName
            FROM Classes
            WHERE ClassID = $1
          `;
          const classResult = await query(getClassQuery, [row.classid]);
          if (classResult.rows.length > 0) {
            const { semesterid, classname } = classResult.rows[0];

            // Get semester name
            const getSemesterQuery = `
              SELECT SemesterName
              FROM Semesters
              WHERE SemesterID = $1
            `;
            const semesterResult = await query(getSemesterQuery, [semesterid]);
            const semesterName = semesterResult.rows[0]?.semestername || null;

            classInfo = {
              classID:      row.classid,
              className:    classname,
              semesterID:   semesterid,
              semesterName: semesterName,
            };
          }
        }

        // Compute flags
        const isEstimated = row.scheduledendtime === null;
        const isDeadline  = row.scheduledendtime !== null && row.duration === 0;

        // Format duration in HH:mm
        function formatDurationToHHMM(totalMinutes) {
          const hrs = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }

        // Compute completed status for past classes
        const now = dayjs();
        let completed = row.completed;
        if (row.eventtype === 'class' && row.scheduledstarttime) {
          const start = dayjs(row.scheduledstarttime);
          if (start.isBefore(now)) {
            completed = true;
          }
        }

        return {
          id:            row.eventid,
          title:         row.title,
          description:   row.description,
          type:          row.eventtype,
          isDeadline,
          isEstimated,
          duration:      formatDurationToHHMM(row.duration),
          start:         row.scheduledstarttime,
          end:           row.scheduledendtime,
          classID:       classInfo?.classID || null,
          classTitle:    classInfo?.className || null,
          semesterID:    classInfo?.semesterID || null,
          semesterName:  classInfo?.semesterName || null,
          completed
        };
      })
    );

    return res.status(200).json({ events: formattedEvents });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Mark one or more tasks (events) as complete or incomplete.
 *
 * Expects `req.body` to contain:
 *   - taskIDs:    {string[]} Array of EventID UUIDs to update (required, non-empty)
 *   - setComplete:{boolean}  Value to set for the Completed field (required)
 *
 * Behavior:
 *   1. Validates that `taskIDs` is a non-empty array.
 *   2. Executes a single SQL UPDATE on `Events`:
 *        UPDATE Events
 *        SET Completed = $1
 *        WHERE EventID = ANY($2::uuid[])
 *   3. Returns HTTP 200 with `{ message: "Tasks complete status updated successfully." }`.
 *
 * Error cases:
 *   - 400 Bad Request if `taskIDs` is missing or empty.
 *   - Any database/server errors are passed to `handleDatabaseError` (resulting in a 5xx response).
 *
 * @param {import('express').Request} req  
 *   - req.body.taskIDs:    {string[]} UUIDs of the tasks to update.
 *   - req.body.setComplete:{boolean}  Whether to mark tasks as complete (`true`) or incomplete (`false`).
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP response indicating success or error.
 */
export const markComplete = async (req, res) => {
  try {
    const taskIDs = req.body.taskIDs;
    const set = req.body.setComplete;
    console.log('Marking tasks complete status for IDs:', taskIDs);

    // Validate that taskIDs is a non-empty array
    if (!Array.isArray(taskIDs) || taskIDs.length === 0) {
      return res
        .status(400)
        .json({ error: "No tasks provided for marking complete." });
    }

    // Update the Completed flag for all matching events
    const updateQuery = `
      UPDATE Events
      SET Completed = $1
      WHERE EventID = ANY($2::uuid[])
    `;
    await query(updateQuery, [set, taskIDs]);

    return res
      .status(200)
      .json({ message: "Tasks complete status updated successfully." });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Update the scheduled start and/or end time of an existing event.
 *
 * Expects `req.body` to contain:
 *   - id:    {string}            EventID UUID of the event to update (required)
 *   - start: {string|null}       New ISO timestamp for ScheduledStartTime (optional)
 *   - end:   {string|null}       New ISO timestamp for ScheduledEndTime (optional)
 *
 * Behavior:
 *   1. Validates that at least one of `start` or `end` is provided.
 *   2. Executes a SQL UPDATE on `Events`:
 *        UPDATE Events
 *        SET ScheduledStartTime = $1,
 *            ScheduledEndTime   = $2
 *        WHERE EventID = $3
 *   3. Returns HTTP 200 with `{ message: "Event times updated successfully." }` on success.
 *
 * Error cases:
 *   - 400 Bad Request if neither `start` nor `end` is provided.
 *   - Any database/server errors are passed to `handleDatabaseError` (resulting in a 5xx response).
 *
 * @param {import('express').Request} req  
 *   - req.body.id:    {string}      The EventID to update.
 *   - req.body.start: {string|null} New start time (ISO string) or null to clear.
 *   - req.body.end:   {string|null} New end time (ISO string) or null to clear.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP response indicating success or error.
 */
export const updateTimes = async (req, res) => {
  try {
    const { id, start, end } = req.body;
    console.log('Updating event times for:', req.body);

    if (start == null && end == null) {
      return res
        .status(400)
        .json({ error: "Start or end time not provided." });
    }

    const updateQuery = `
      UPDATE Events
      SET ScheduledStartTime = $1,
          ScheduledEndTime   = $2
      WHERE EventID = $3
    `;
    await query(updateQuery, [start, end, id]);

    return res
      .status(200)
      .json({ message: "Event times updated successfully." });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Update an existing task/event’s details.
 *
 * Expects `req.body` to contain:
 *   - taskID:          {string}   UUID of the event to update (required)
 *   - taskName:        {string}   New title for the task (required)
 *   - taskDescription: {string}   New description for the task (optional)
 *   - taskType:        {string}   New event type (e.g. 'homework', 'meeting') (required)
 *   - taskStart:       {string|Date} ISO date/time for new start (optional)
 *   - taskEnd:         {string|Date} ISO date/time for new end (optional)
 *   - duration:        {number}   New duration in minutes (required)
 *   - taskClass:       {string|null} UUID of associated class, if any (optional)
 *   - completed:       {boolean}  New completed status (required)
 *
 * Behavior:
 *   1. Validates that `taskID` is provided, else returns 400.
 *   2. Parses `taskStart` and `taskEnd` via Day.js into ISO strings or null.
 *   3. Executes a SQL UPDATE on `Events`, setting all provided fields.
 *   4. If no row is updated, returns 404.
 *   5. On success, returns HTTP 200 with `{ message, task }`.
 *
 * Error cases:
 *   - 400 Bad Request if `taskID` is missing.
 *   - Delegates any other errors to `handleDatabaseError` (500 response).
 *
 * @param {import('express').Request} req
 *   - req.body.taskID
 *   - req.body.taskName
 *   - req.body.taskDescription
 *   - req.body.taskType
 *   - req.body.taskStart
 *   - req.body.taskEnd
 *   - req.body.duration
 *   - req.body.taskClass
 *   - req.body.completed
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP response with updated task or error
 */
export const editTask = async (req, res) => {
  try {
    const task = req.body;
    console.log('Editing task:', task);

    // Ensure the Task ID is provided
    if (!task.taskID) {
      return res.status(400).json({ error: "Task ID is required for update." });
    }

    // Parse and format the start and end times
    const taskStart = task.taskStart && dayjs(task.taskStart).isValid()
      ? dayjs(task.taskStart).toISOString()
      : null;
    const taskEnd = task.taskEnd && dayjs(task.taskEnd).isValid()
      ? dayjs(task.taskEnd).toISOString()
      : null;

    // Update all available fields
    const updateQuery = `
      UPDATE Events
      SET Title               = $1,
          Description         = $2,
          EventType           = $3,
          ScheduledStartTime  = $4,
          ScheduledEndTime    = $5,
          Duration            = $6,
          ClassID             = $7,
          Completed           = $8
      WHERE EventID = $9
      RETURNING *
    `;
    const values = [
      task.taskName,
      task.taskDescription,
      task.taskType,
      taskStart,
      taskEnd,
      task.duration,
      task.taskClass,
      task.completed,
      task.taskID,
    ];

    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      task: result.rows[0]
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Retrieve upcoming and recent events for a user’s dashboard view.
 *
 * Behavior:
 *   1. Validates `req.params.userID` is provided, else returns 400.
 *   2. Defines a time window from yesterday at 00:00 through 14 days from now at 23:59.
 *   3. Queries `Events` for this user where
 *        COALESCE(scheduledStartTime, scheduledEndTime)
 *        lies between the window bounds, ordered chronologically.
 *   4. For each event:
 *        a. If `classID` is non-null:
 *           - Fetch `ClassName` and `SemesterID` from `Classes`.
 *           - Fetch `SemesterName` from `Semesters`.
 *           - Populate `classTitle` and `semesterName`.
 *        b. Compute:
 *           - `isDeadline`: `scheduledEndTime ≠ null && duration === 0`
 *        c. Format `duration` (minutes) → `"HH:mm"`.
 *        d. Compute `completed` override:
 *           - If `eventType === 'class'` and `scheduledStartTime` is before now, force `true`.
 *   5. Returns HTTP 200 with `{ events: [...] }`.
 *
 * Error handling:
 *   - 400 Bad Request if `userID` is missing.
 *   - Delegates other errors to `handleDatabaseError`.
 *
 * @param {import('express').Request} req
 *   - req.params.userID: {string} the ID of the user whose events to fetch.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP response with formatted events.
 */
export const getEventsForDashboard = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!userID) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Define window: yesterday → 14 days out
    const windowStart = dayjs().startOf("day").subtract(1, "day");
    const windowEnd   = dayjs().add(14, "day").endOf("day");

    // Fetch events in the window
    const result = await query(
      `SELECT *
         FROM Events
        WHERE UserID = $1
          AND COALESCE(scheduledstarttime, scheduledendtime)
              BETWEEN $2 AND $3
        ORDER BY COALESCE(scheduledstarttime, scheduledendtime)`,
      [userID, windowStart.toDate(), windowEnd.toDate()]
    );

    // Enrich and format each event
    const formattedEvents = await Promise.all(
      result.rows.map(async (row) => {
        let classInfo = null;
        if (row.classid !== null) {
          // Fetch class metadata
          const classResult = await query(
            `SELECT SemesterID, ClassName
               FROM Classes
              WHERE ClassID = $1`,
            [row.classid]
          );
          if (classResult.rows.length > 0) {
            const { semesterid, classname } = classResult.rows[0];
            // Fetch semester name
            const semRes = await query(
              `SELECT SemesterName
                 FROM Semesters
                WHERE SemesterID = $1`,
              [semesterid]
            );
            const semesterName = semRes.rows[0]?.semestername || null;
            classInfo = { className: classname, semesterName };
          }
        }

        // Compute deadline flag
        const isDeadline = row.scheduledendtime !== null && row.duration === 0;

        // Format duration to "HH:mm"
        function formatDurationToHHMM(totalMinutes) {
          const hrs = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }

        // Override completed for past classes
        const now = dayjs();
        let completed = row.completed;
        if (row.eventtype === 'class' && row.scheduledstarttime) {
          if (dayjs(row.scheduledstarttime).isBefore(now)) {
            completed = true;
          }
        }

        return {
          id:           row.eventid,
          title:        row.title,
          description:  row.description,
          type:         row.eventtype,
          isDeadline,
          duration:     formatDurationToHHMM(row.duration),
          start:        row.scheduledstarttime,
          end:          row.scheduledendtime,
          classTitle:   classInfo?.className || null,
          semesterName: classInfo?.semesterName || null,
          completed
        };
      })
    );

    console.log(formattedEvents);
    return res.status(200).json({ events: formattedEvents });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};