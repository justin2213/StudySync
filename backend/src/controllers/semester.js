import { query, handleDatabaseError } from '../utils/client.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import dayjs from 'dayjs';

/**
 * Create a new semester along with its classes, grade distributions, and recurring class events.
 *
 * Expects `req.body` to contain:
 *   - semesterName:    {string}    Name of the semester (required)
 *   - userID:          {string}    ID of the user creating the semester (required)
 *   - semesterStart:   {string|Date} ISO date string or Date object for semester start (required)
 *   - semesterEnd:     {string|Date} ISO date string or Date object for semester end (required)
 *   - classes:         {Array<object>} List of class definitions, each with:
 *       • className:         {string}     Name of the class (required)
 *       • classStart:        {string}     Time of day for class start (e.g. "09:00:00") (required)
 *       • classEnd:          {string}     Time of day for class end (e.g. "10:15:00") (required)
 *       • classDays:         {string[]}   Weekday names matching PostgreSQL `to_char(..., 'FMDay')` (e.g. ['Monday', 'Wednesday']) (required)
 *       • gradeDistribution: {Array<object>} Grading categories for the class:
 *            – category: {string} Name of the grade category (required)
 *            – weight:   {number} Weight of this category in final grade (required)
 *
 * Behavior:
 *   1. Validates `semesterName` and `userID` are present.
 *   2. Parses and formats `semesterStart` / `semesterEnd` to "YYYY-MM-DD".
 *   3. Inserts a new row into `Semesters`.
 *   4. For each class:
 *       a. Generates a UUID and parses/formats `classStart`/`classEnd` to "HH:mm:ss".
 *       b. Inserts into `Classes`.
 *       c. Inserts each grade distribution category into `Grade_Distribution`.
 *       d. Generates one `Events` row per matching date in the semester (using PostgreSQL’s `generate_series`),
 *          combining the class days and times into timestamped events.
 *   5. Returns HTTP 200 with the newly created semester record.
 *
 * Error handling:
 *   - 400 Bad Request if `semesterName` or `userID` is missing, or if any class’s start/end time is invalid.
 *   - Delegates all other errors to `handleDatabaseError`, resulting in a 5xx response.
 *
 * @param {import('express').Request} req   Express request, with semester payload in `req.body`
 * @param {import('express').Response} res  Express response
 * @returns {Promise<import('express').Response>} HTTP response with the created semester or an error
 */
export const createSemester = async (req, res) => {
  try {
    const semesterID = uuidv4();
    console.log('Creating semester with payload:', req.body);

    const semester = req.body;
    if (!semester.semesterName || !semester.userID) {
      return res
        .status(400)
        .json({ error: "Missing required fields: semesterName and userID" });
    }

    // Format semester dates
    const startDate = dayjs(semester.semesterStart).format("YYYY-MM-DD");
    const endDate   = dayjs(semester.semesterEnd).format("YYYY-MM-DD");

    // Insert semester record
    const insertSemesterQuery = `
      INSERT INTO Semesters
        (SemesterID, UserID, SemesterName, SemesterStart, SemesterEnd)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      semesterID,
      semester.userID,
      semester.semesterName,
      startDate,
      endDate
    ];
    const result = await query(insertSemesterQuery, values);

    // For each class in the payload: insert class, grade distribution, and events
    for (const classInfo of semester.classes) {
      const classID = uuidv4();
      const parsedStart = dayjs(classInfo.classStart, "YYYY-MM-DD HH:mm:ss", true);
      const parsedEnd   = dayjs(classInfo.classEnd,   "YYYY-MM-DD HH:mm:ss", true);

      if (!parsedStart.isValid() || !parsedEnd.isValid()) {
        return res
          .status(400)
          .json({ error: "Invalid classStart or classEnd format. Expected 'HH:mm:ss'." });
      }

      const classStart = parsedStart.format("HH:mm:ss");
      const classEnd   = parsedEnd.format("HH:mm:ss");

      // Insert class record
      const insertClassQuery = `
        INSERT INTO Classes
          (ClassID, SemesterID, ClassName, ClassStart, ClassEnd, ClassDays)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const classValues = [
        classID,
        semesterID,
        classInfo.className,
        classStart,
        classEnd,
        classInfo.classDays
      ];
      await query(insertClassQuery, classValues);

      // Insert grade distribution categories
      for (const dist of classInfo.gradeDistribution) {
        const categoryID = uuidv4();
        const insertDistQuery = `
          INSERT INTO Grade_Distribution
            (CategoryID, ClassID, CategoryName, Weight)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const distValues = [
          categoryID,
          classID,
          dist.category,
          dist.weight
        ];
        await query(insertDistQuery, distValues);
      }

      // Generate recurring class events for each matching day in the semester
      const insertEventsQuery = `
        INSERT INTO Events (
          EventID, UserID, Title, EventType,
          ScheduledStartTime, ScheduledEndTime, Duration, ClassID
        )
        SELECT
          gen_random_uuid(),
          s.UserID,
          c.ClassName,
          'class',
          (d.day + c.ClassStart)::timestamp,
          (d.day + c.ClassEnd)::timestamp,
          EXTRACT(
            EPOCH FROM (
              (timestamp '2000-01-01' + c.ClassEnd)
              - (timestamp '2000-01-01' + c.ClassStart)
            )
          ) / 60,
          c.ClassID
        FROM Classes c
        JOIN Semesters s ON c.SemesterID = s.SemesterID
        JOIN generate_series(s.SemesterStart, s.SemesterEnd, interval '1 day')
          AS d(day) ON TRUE
        WHERE c.ClassID = $1
          AND to_char(d.day, 'FMDay') = ANY(c.ClassDays);
      `;
      await query(insertEventsQuery, [classID]);
    }

    const newSemester = result.rows[0];
    return res.status(200).json(newSemester);

  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Retrieve all semesters for a given user, including their classes and grade distributions.
 *
 * For each semester:
 *  1. Fetches the semester record(s) by userID.
 *  2. For each semester:
 *     - Fetches all Classes associated with that SemesterID.
 *     - Parses stored class start/end times (HH:mm:ss).
 *     - Fetches each class’s grade distribution categories.
 *     - Assembles a structured object:
 *         {
 *           classID,
 *           className,
 *           classStart,      // "HH:mm:ss" string
 *           classEnd,        // "HH:mm:ss" string
 *           classDays,       // string[] of weekdays
 *           grade_distribution: [
 *             { categoryID, categoryName, weight }, …
 *           ]
 *         }
 *  3. Returns an array of semester objects:
 *     {
 *       semesterID,
 *       userID,
 *       semesterName,
 *       semesterStart,   // Day.js object
 *       semesterEnd,     // Day.js object
 *       classes: [ … ]
 *     }
 *
 * Responses:
 *  - 200 + []           if the user has no semesters.
 *  - 200 + array        on success.
 *  - Delegates errors to handleDatabaseError (5xx).
 *
 * @param {import('express').Request} req
 *   - req.params.id: {string} the UserID to fetch semesters for.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP response with semesters array.
 */
export const getSemesters = async (req, res) => {
  try {
    const userID = req.params.id;

    // 1. Fetch semester records for this user
    const semesterQuery = `
      SELECT *
      FROM Semesters
      WHERE userID = $1
    `;
    const semestersResult = await query(semesterQuery, [userID]);

    if (semestersResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    const semesters = [];

    // 2. For each semester, fetch and assemble its classes
    for (const sem of semestersResult.rows) {
      const semesterID = sem.semesterid;

      // Fetch Classes for this semester
      const classesQuery = `
        SELECT *
        FROM Classes
        WHERE SemesterID = $1
      `;
      const classesResult = await query(classesQuery, [semesterID]);

      const classes = [];
      for (const cls of classesResult.rows) {
        // Parse class start/end times (HH:mm:ss)
        const [h, m, s] = cls.classstart.split(':').map(Number);
        const [eh, em, es] = cls.classend.split(':').map(Number);

        // Fetch grade distribution for this class
        const distQuery = `
          SELECT *
          FROM Grade_Distribution
          WHERE ClassID = $1
        `;
        const distResult = await query(distQuery, [cls.classid]);

        classes.push({
          classID: cls.classid,
          className: cls.classname,
          classStart: cls.classstart,
          classEnd: cls.classend,
          classDays: cls.classdays || [],
          grade_distribution: distResult.rows.map(dist => ({
            categoryID: dist.categoryid,
            categoryName: dist.categoryname,
            weight: dist.weight
          }))
        });
      }

      // Assemble semester object
      semesters.push({
        semesterID: sem.semesterid,
        userID: sem.userid,
        semesterName: sem.semestername,
        semesterStart: dayjs(sem.semesterstart),
        semesterEnd: dayjs(sem.semesterend),
        classes
      });
    }

    // 3. Return the assembled semesters
    return res.status(200).json(semesters);

  } catch (err) {
    // Delegate unexpected errors
    return handleDatabaseError(err, res);
  }
};

/**
 * Delete a semester by its ID.
 *
 * Removes the semester record from the database. If foreign-key constraints
 * do not cascade, any dependent rows (e.g., Events, Classes, Grade_Distribution)
 * should be deleted first (see commented cleanup query).
 *
 * On success:
 *   - Executes DELETE FROM Semesters WHERE SemesterID = $1
 *   - Returns HTTP 204 No Content.
 *
 * Error handling:
 *   - Delegates database errors to `handleDatabaseError`, resulting in a 5xx response.
 *
 * @param {import('express').Request} req
 *   - req.params.semesterID: {string} UUID of the semester to delete.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response|void>}
 */
export const deleteSemester = async (req, res) => {
  const { semesterID } = req.params;

  try {
    // If your foreign keys are NOT configured with ON DELETE CASCADE,
    // uncomment the following line to remove related Events first:
    // await query(`DELETE FROM Events WHERE ClassID IN (SELECT ClassID FROM Classes WHERE SemesterID = $1)`, [semesterID]);

    // Delete the semester row
    await query(
      `DELETE FROM Semesters WHERE SemesterID = $1`,
      [semesterID]
    );

    // 204 No Content indicates successful deletion with no body
    return res.status(204).end();
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};