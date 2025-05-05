import { query, handleDatabaseError } from '../utils/client.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import dayjs from 'dayjs';

/**
 * Controller: getClass
 * 
 * Fetches detailed information for a single class, including its grade distribution
 * and associated grades, and returns it as JSON.
 *
 * @async
 * @function getClass
 * @param {import('express').Request} req
 *   - req.params.classID: the UUID of the class to retrieve
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} 
 *   - On success: HTTP 200 with JSON body containing class details and grades
 *   - On not found: HTTP 404 with `{ error: "Class not found" }`
 *   - On error: delegates to `handleDatabaseError`
 *
 * Response payload structure:
 * ```json
 * {
 *   "classID": "uuid",
 *   "className": "string",
 *   "classStart": "time",
 *   "classEnd": "time",
 *   "classDays": ["Monday", "Wednesday", ...],
 *   "grades": [
 *     {
 *       "categoryID": "uuid",
 *       "categoryName": "string",
 *       "weight": number,
 *       "grades": [
 *         {
 *           "gradeID": "uuid",
 *           "assignmentName": "string",
 *           "score": number,
 *           "maxScore": number
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 * ```
 */
export const getClass = async (req, res) => {
  try {
    const classID = req.params.classID;

    // Retrieve the class record
    const classQuery = `
      SELECT * FROM Classes
      WHERE ClassID = $1
    `;
    const classResult = await query(classQuery, [classID]);

    // If no class found, return 404
    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    const classInfo = classResult.rows[0];

    // Retrieve grade distribution for the class
    const distQuery = `
      SELECT * FROM Grade_Distribution
      WHERE ClassID = $1
    `;
    const distResult = await query(distQuery, [classID]);

    // For each category, fetch its grades
    let grades = [];
    for (const dist of distResult.rows) {
      const categoryID = dist.categoryid;

      const gradeQuery = `
        SELECT * FROM Grades
        WHERE CategoryID = $1
      `;
      const gradeResult = await query(gradeQuery, [categoryID]);

      let catGrades = [];
      for (const catGrade of gradeResult.rows) {
        catGrades.push({
          gradeID:       catGrade.gradeid,
          assignmentName: catGrade.assignmentname,
          score:          catGrade.score,
          maxScore:       catGrade.maxscore,
        });
      }

      grades.push({
        categoryID:   dist.categoryid,
        categoryName: dist.categoryname,
        weight:       dist.weight,
        grades:       catGrades,
      });
    }

    // Format and send the combined response
    const formattedClassInfo = {
      classID:   classInfo.classid,
      className: classInfo.classname,
      classStart: classInfo.classstart,
      classEnd:   classInfo.classend,
      classDays:  classInfo.classdays,
      grades:     grades,
    };
    return res.status(200).json(formattedClassInfo);

  } catch (err) {
    // Handle any database or unexpected errors
    return handleDatabaseError(err, res);
  }
};

/**
 * Create a new class and its associated events and grade distributions.
 *
 * Expects `req.body` to contain:
 *   - className:            {string}       Name of the class (required)
 *   - classSemester:        {object}       Semester info (required)
 *       • semesterID:       {string}       ID of the existing semester
 *   - classStart:           {string|Date}  ISO date/time or Date object for class start (required)
 *   - classEnd:             {string|Date}  ISO date/time or Date object for class end (required)
 *   - classDays:            {string[]}     Array of weekday names matching PostgreSQL’s to_char(..., 'FMDay') (e.g. ['Monday', 'Wednesday'])
 *   - gradeDistribution:    {Array<object>} Array of grading categories:
 *       • category:         {string}       Name of the grading category
 *       • weight:           {number}       Weight of this category in final grade
 *
 * On success:
 *   - Inserts one row into Classes.
 *   - Generates one Event per day of the semester matching classDays.
 *   - Inserts one Grade_Distribution row per category.
 *   - Returns HTTP 200 with the newly created class row.
 *
 * On client error (400):
 *   - Missing className or semesterID.
 *   - Invalid classStart/classEnd format.
 *
 * On server/database error:
 *   - Delegates to handleDatabaseError to send appropriate HTTP 5xx response.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {Promise<import('express').Response>} HTTP response
 */
export const createClass = async (req, res) => {
  try {
    // Generate a new UUID for the class
    const classID = uuidv4();
    const classData = req.body;
    console.log('Received class data:', classData);

    // Validate required fields
    if (!classData.className || !classData.classSemester?.semesterID) {
      return res
        .status(400)
        .json({ error: "Missing required fields: className and semesterID" });
    }

    // Parse and validate start/end times
    const parsedStart = dayjs(classData.classStart);
    const parsedEnd = dayjs(classData.classEnd);
    if (!parsedStart.isValid() || !parsedEnd.isValid()) {
      return res.status(400).json({
        error:
          "Invalid classStart or classEnd format. Expected a valid ISO date string.",
      });
    }
    const classStart = parsedStart.format("HH:mm:ss");
    const classEnd   = parsedEnd.format("HH:mm:ss");

    // Insert into Classes table
    const insertClassQuery = `
      INSERT INTO Classes (
        ClassID, SemesterID, ClassName, ClassStart, ClassEnd, ClassDays
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      classID,
      classData.classSemester.semesterID,
      classData.className,
      classStart,
      classEnd,
      classData.classDays,
    ];
    const result = await query(insertClassQuery, values);
    const newClass = result.rows[0];

    // Generate one Event per scheduled class day across the semester
    const insertEventsQuery = `
      INSERT INTO Events (
        EventID, UserID, Title, EventType,
        ScheduledStartTime, ScheduledEndTime, Duration, ClassID
      )
      SELECT
        gen_random_uuid(),                 -- New event ID
        s.UserID,                          -- User from the semester
        c.ClassName,                       -- Class name as title
        'class',                           -- Type = 'class'
        (d.day + c.ClassStart)::timestamp, -- Date + start time
        (d.day + c.ClassEnd)::timestamp,   -- Date + end time
        EXTRACT(
          EPOCH FROM (
            (timestamp '2000-01-01' + c.ClassEnd)
            - (timestamp '2000-01-01' + c.ClassStart)
          )
        ) / 60,                            -- Duration in minutes
        c.ClassID                          -- Link back to this class
      FROM Classes c
      JOIN Semesters s ON s.SemesterID = c.SemesterID
      JOIN generate_series(s.SemesterStart, s.SemesterEnd, interval '1 day') AS d(day)
        ON TRUE
      WHERE c.ClassID = $1
        AND to_char(d.day, 'FMDay') = ANY(c.ClassDays);
    `;
    await query(insertEventsQuery, [classID]);

    // Insert grade distribution categories
    for (const dist of classData.gradeDistribution) {
      const categoryID = uuidv4();
      const insertDistQuery = `
        INSERT INTO Grade_Distribution (
          CategoryID, ClassID, CategoryName, Weight
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const distValues = [categoryID, classID, dist.category, dist.weight];
      await query(insertDistQuery, distValues);
    }

    // Return the created class record
    return res.status(200).json(newClass);

  } catch (err) {
    // Handle unexpected database or server errors
    return handleDatabaseError(err, res);
  }
};

/**
 * Delete a class by its ID.
 *
 * Removes the class record from the database. If foreign-key constraints
 * do not cascade (e.g., Events or Grade_Distribution rows still reference this class),
 * uncomment the cleanup query to delete related rows first.
 *
 * On success:
 *   - Executes DELETE FROM Classes WHERE ClassID = $1
 *   - Returns HTTP 204 No Content.
 *
 * Error handling:
 *   - Delegates database errors to `handleDatabaseError`, resulting in a 5xx response.
 *
 * @param {import('express').Request} req
 *   - req.params.classID: {string} UUID of the class to delete.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response|void>}
 */
export const deleteClass = async (req, res) => {
  const { classID } = req.params;

  try {
    // If your foreign keys are NOT configured with ON DELETE CASCADE,
    // uncomment the following line to remove related Events first:
    // await query(`DELETE FROM Events WHERE ClassID = $1`, [classID]);

    // Delete the class row
    await query(
      `DELETE FROM Classes WHERE ClassID = $1`,
      [classID]
    );

    // 204 No Content indicates successful deletion with no body
    return res.status(204).end();
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};