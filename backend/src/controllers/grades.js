import { query, handleDatabaseError } from '../utils/client.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import dayjs from 'dayjs';

/**
 * Add a new grade entry for a student.
 *
 * Expects `req.body` to contain:
 *   - categoryID:      {string}   ID of the Grade_Distribution category (required)
 *   - assignmentName:  {string}   Name of the assignment (required)
 *   - score:           {number}   Points earned (required)
 *   - maxScore:        {number}   Maximum possible points (required)
 *   - semesterID:      {string}   ID of the semester (optional)
 *   - classID:         {string}   ID of the class (optional)
 *
 * If `semesterID` or `classID` is missing, it will:
 *   1. Lookup the ClassID associated with the given CategoryID in Grade_Distribution.
 *   2. Populate `grade.classID` from that result.
 *
 * Inserts one row into Grades, then returns:
 *   - HTTP 201 with `{ message, grade }` on success.
 *
 * Error cases:
 *   - Missing `categoryID` or other required body fields will bubble
 *     through to database errors (400/500 as appropriate).
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {Promise<import('express').Response>} HTTP response
 */
export const addGrade = async (req, res) => {
  try {
    const gradeID = uuidv4();
    const grade = { ...req.body };
    console.log('Received grade payload:', grade);

    // If semesterID or classID not provided, fetch classID from Grade_Distribution
    if (!grade.semesterID || !grade.classID) {
      const classQuery = `
        SELECT ClassID
        FROM Grade_Distribution
        WHERE CategoryID = $1
      `;
      const result = await query(classQuery, [grade.categoryID]);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'No class found for given categoryID' });
      }
      grade.classID = result.rows[0].classid;
      console.log('Resolved classID from CategoryID:', grade.classID);
    }

    // Insert the new grade record
    const insertGradeQuery = `
      INSERT INTO Grades (
        GradeID,
        ClassID,
        CategoryID,
        AssignmentName,
        Score,
        MaxScore
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      gradeID,
      grade.classID,
      grade.categoryID,
      grade.assignmentName,
      parseFloat(grade.score),
      parseFloat(grade.maxScore),
    ];
    const result = await query(insertGradeQuery, values);

    return res
      .status(201)
      .json({ message: "Grade added successfully", grade: result.rows[0] });

  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

/**
 * Delete an existing grade entry by its ID.
 *
 * Expects `req.params.gradeID`:
 *   - gradeID: {string} ID of the grade to delete (required)
 *
 * Deletes the matching row from Grades and returns:
 *   - HTTP 200 with `{ message, deletedGrade }` if deletion succeeds.
 *   - HTTP 404 if no grade with that ID exists.
 *   - HTTP 400 if `gradeID` is not provided.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {Promise<import('express').Response>} HTTP response
 */
export const deleteGrade = async (req, res) => {
  try {
    const { gradeID } = req.params;
    console.log('Received delete request for gradeID:', gradeID);

    if (!gradeID) {
      return res.status(400).json({ error: "GradeID is required" });
    }

    const deleteQuery = `
      DELETE FROM Grades
      WHERE GradeID = $1
      RETURNING *
    `;
    const { rows } = await query(deleteQuery, [gradeID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Grade not found" });
    }

    return res
      .status(200)
      .json({ message: "Grade deleted successfully", deletedGrade: rows[0] });

  } catch (err) {
    logger.error("Database Error:", err);
    return handleDatabaseError(err, res);
  }
};

/**
 * Calculate and return each class’s overall percentage grade for every semester of a user.
 *
 * Steps performed:
 *   1. Fetch all semesters for the given userID.
 *   2. For each semester:
 *      - Fetch all classes in that semester.
 *      - For each class:
 *          • Fetch its grade distribution categories (weights).
 *          • Fetch all grades in each category.
 *          • Compute the category’s earned percentage (sum(scores) / sum(maxScores)).
 *          • Multiply by the category weight and accumulate.
 *          • Accumulate total weights.
 *      - Compute the class’s weighted average percentage:
 *            (totalWeighted / totalWeight) * 100, or 0 if no graded categories.
 *   3. Sort semesters so that:
 *      • The current semester (today between start and end) appears first.
 *      • Upcoming semesters next (start date > today), newest first.
 *      • Past semesters last, newest first.
 *   4. Return an array of semesters, each with:
 *        { semesterID, semesterName, classes: [ { classID, className, totalGrade } ] }
 *
 * Responses:
 *   - 200 + []                 if the user has no semesters.
 *   - 200 + array of semester objects on success.
 *   - Delegates to handleDatabaseError on database/server errors.
 *
 * @param {import('express').Request} req
 *   - req.params.id: {string} the UserID to fetch semesters for.
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>} HTTP 200 with JSON payload, or error via handleDatabaseError.
 */
export const calculateGradesBySemester = async (req, res) => {
  try {
    const userID = req.params.id;

    // 1. Fetch semesters for this user
    const semestersResult = await query(
      `SELECT SemesterID, SemesterName, SemesterStart, SemesterEnd
       FROM Semesters
       WHERE UserID = $1`,
      [userID]
    );
    if (semestersResult.rows.length === 0) {
      // No semesters → return empty array
      return res.status(200).json([]);
    }

    // Map rows into working semester objects
    const semesters = semestersResult.rows.map(sem => ({
      semesterID:    sem.semesterid,
      semesterName:  sem.semestername,
      semesterStart: dayjs(sem.semesterstart),
      semesterEnd:   dayjs(sem.semesterend),
      classes:       []
    }));

    // 2. For each semester, compute each class’s totalGrade
    for (const sem of semesters) {
      // Fetch classes in this semester
      const classesResult = await query(
        `SELECT ClassID, ClassName
         FROM Classes
         WHERE SemesterID = $1`,
        [sem.semesterID]
      );

      for (const cls of classesResult.rows) {
        // Fetch grade distribution (weights) for this class
        const distResult = await query(
          `SELECT CategoryID, Weight
           FROM Grade_Distribution
           WHERE ClassID = $1`,
          [cls.classid]
        );

        let totalWeighted = 0;
        let totalWeight = 0;

        // For each category, fetch all grades and accumulate
        for (const dist of distResult.rows) {
          const gradesResult = await query(
            `SELECT Score, MaxScore
             FROM Grades
             WHERE CategoryID = $1`,
            [dist.categoryid]
          );

          const earned = gradesResult.rows.reduce(
            (sum, g) => sum + parseFloat(g.score),
            0
          );
          const possible = gradesResult.rows.reduce(
            (sum, g) => sum + parseFloat(g.maxscore),
            0
          );

          if (possible > 0) {
            totalWeighted += (earned / possible) * dist.weight;
            totalWeight   += dist.weight;
          }
        }

        // Compute percentage, defaulting to 0 if no graded categories
        const totalGrade = totalWeight > 0
          ? (totalWeighted / totalWeight) * 100
          : 0;

        sem.classes.push({
          classID:    cls.classid,
          className:  cls.classname,
          totalGrade: Number(totalGrade.toFixed(2))
        });
      }
    }

    // 3. Sort semesters: current → upcoming → past, each group newest-first
    const now = dayjs();
    const rankSemester = sem => {
      if (now.isAfter(sem.semesterStart) && now.isBefore(sem.semesterEnd)) {
        return 0; // current
      }
      if (sem.semesterStart.isAfter(now)) {
        return 1; // upcoming
      }
      return 2;   // past
    };

    semesters.sort((a, b) => {
      const ra = rankSemester(a), rb = rankSemester(b);
      if (ra !== rb) return ra - rb;
      // Newer start date first
      return b.semesterStart.valueOf() - a.semesterStart.valueOf();
    });

    // 4. Build output payload
    const output = semesters.map(({ semesterID, semesterName, classes }) => ({
      semesterID,
      semesterName,
      classes
    }));

    // Return the computed grades by semester
    return res.status(200).json(output);

  } catch (err) {
    logger.error("Error in calculateGradesBySemester:", err);
    return handleDatabaseError(err, res);
  }
};