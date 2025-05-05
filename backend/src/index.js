/**
 * @file index.js
 * @description
 * Entry point for the REST API server.  
 * - Loads environment variables via dotenv.  
 * - Creates and configures an Express application:
 *     • Enables CORS  
 *     • Parses JSON request bodies  
 *     • Mounts routers for semesters, classes, grades, and tasks  
 * - Starts listening on the configured port and logs startup status.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import semesterRoutes from "./routes/semester.js";
import classRoutes from "./routes/classes.js";
import gradeRoutes from "./routes/grades.js";
import taskRoutes from "./routes/tasks.js";
import logger from "./utils/logger.js";

// Load environment variables from .env into process.env
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());
// Automatically parse JSON bodies for incoming requests
app.use(express.json());

// Mount the semester routes at /semesters
try {
  app.use("/semesters", semesterRoutes);
} catch (error) {
  logger.error("Failed to mount /semesters routes:", error);
}

// Mount the class routes at /classes
try {
  app.use("/classes", classRoutes);
} catch (error) {
  logger.error("Failed to mount /classes routes:", error);
}

// Mount the grade routes at /grades
try {
  app.use("/grades", gradeRoutes);
} catch (error) {
  logger.error("Failed to mount /grades routes:", error);
}

// Mount the task routes at /tasks
try {
  app.use("/tasks", taskRoutes);
} catch (error) {
  logger.error("Failed to mount /tasks routes:", error);
}

// Determine port from environment or default to 3001
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    logger.error("Server failed to start:", err);
  } else {
    logger.info(`Server is listening on port ${PORT}`);
  }
});
