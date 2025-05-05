import express from "express";
import { createSemester, deleteSemester, getSemesters } from "../controllers/semester.js";

const router = express.Router();

router.post('/', createSemester);

router.get("/:id", getSemesters);

router.delete("/:semesterID", deleteSemester);

export default router;