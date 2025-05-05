/**
 * @module utils/logger
 * @description
 * Configures and exports a Winston logger for application-wide use.
 *
 * Logging level:
 *   - Default: 'info' (logs 'info', 'warn', 'error', etc.)
 *
 * Transports:
 *   - Console: colorized, timestamped output for all levels.
 *   - File 'error.log': persisting only 'error' level entries.
 *
 * Log format:
 *   - Combines colorization, ISO timestamp, and a printf formatter:
 *     `${timestamp} [${level}] - ${message}`
 */

import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] - ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

export default logger;
