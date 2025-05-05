import express from "express";
import { addGrade, deleteGrade, calculateGradesBySemester } from "../controllers/grades.js";

const router = express.Router();

router.post("/", addGrade);

router.delete("/:gradeID", deleteGrade);

router.get("/:id", calculateGradesBySemester);

export default router;