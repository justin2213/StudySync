/**
 * @module utils/client
 * @description
 * Provides PostgreSQL database utilities:
 *  - Establishes a connection pool using environment variables.
 *  - Exposes a `query` helper for executing SQL statements.
 *  - Provides `getClientForTransaction` to start manual transactions.
 *  - Supplies `handleDatabaseError` middleware for Express error handling.
 */

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// Log connection details (excluding password) for debugging
console.log("Connecting to DB with:", {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  database: process.env.DB_DATABASE,
  port:     process.env.DB_PORT,
});

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port:     process.env.DB_PORT,
});

/**
 * Execute a SQL query using the shared connection pool.
 * Automatically acquires and releases a client.
 *
 * @async
 * @param {string} text                 The SQL query text (may include placeholders like $1, $2, …).
 * @param {Array<any>} [params=[]]      Optional array of parameter values to bind.
 * @returns {Promise<import('pg').QueryResult>}  
 *   Resolves with the query result (rows, rowCount, etc.).
 * @throws {Error} Propagates any error thrown by `pg` during query execution.
 */
export const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Acquire a dedicated client from the pool for manual transaction control.
 * Caller is responsible for calling `client.release()` when done.
 *
 * @async
 * @returns {Promise<import('pg').PoolClient>} A connected client instance.
 */
export const getClientForTransaction = async () => {
  return await pool.connect();
};

/**
 * Express-compatible error handler for database errors.
 * Logs the error and sends a 500 response with a generic message.
 *
 * @param {Error} error               The error thrown during database operations.
 * @param {import('express').Response} res  
 *   Express response object used to send the HTTP error.
 * @returns {void}
 */
export const handleDatabaseError = (error, res) => {
  console.error("Database error:", error);
  res
    .status(500)
    .json({
      message: "Internal Server Error",
      error:   error.message
    });
};
