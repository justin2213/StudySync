import express from "express";
import { getClass, createClass, deleteClass } from "../controllers/classes.js";

const router = express.Router();

router.get("/:classID", getClass);

router.post('/', createClass);

router.delete("/:classID", deleteClass);

export default router;
