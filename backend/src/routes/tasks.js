import express from "express";
import { 
  getTasks,
  createTask,
  editTask,
  deleteTasks,
  markComplete,
  getEventsForCalendar,
  getEventsForDashboard,
  updateTimes,
} from "../controllers/tasks.js";

const router = express.Router();

router.get("/:userID", getTasks);

router.get("/calendar/:userID", getEventsForCalendar);

router.get("/dashboard/:userID", getEventsForDashboard);

router.post("/", createTask);   

router.delete("/delete", deleteTasks);

router.patch("/complete", markComplete);

router.patch("/time", updateTimes);

router.put("/", editTask);

export default router;
