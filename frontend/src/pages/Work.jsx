import React, { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import dayjs from "dayjs";
import { useSession } from "@supabase/auth-helpers-react";
import UpcomingTable from "../components/WorkPage/UpcomingTable.jsx";
import DeadlineTable from "../components/WorkPage/DeadlineTable.jsx";
import CompletedTable from "../components/WorkPage/CompletedTable.jsx";
import LoadingIndicator from "../components/Loading.jsx";

/**
 * Work component fetches and displays user tasks categorized into upcoming,
 * deadline-based, and completed sections. Handles loading and error states.
 */
function Work() {
  // Local state for tracking loading, errors, and tasks data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Get authenticated user session
  const { user } = useSession();
  const userID = user?.id;

  /**
   * Fetch tasks from backend when userID is available.
   * Formats taskStart and taskEnd as dayjs objects for easier date comparisons.
   */
  useEffect(() => {
    if (!userID) return;

    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/tasks/${userID}`,
        );
        // Convert ISO date strings to dayjs instances
        const formattedTasks = response.data.tasks.map((task) => ({
          ...task,
          taskStart: task.taskStart ? dayjs(task.taskStart) : null,
          taskEnd: task.taskEnd ? dayjs(task.taskEnd) : null,
        }));
        setTasks(formattedTasks);
      } catch (err) {
        // Capture any errors during fetch
        setError(err.response?.data || "Error fetching tasks");
      } finally {
        // Stop loading indicator
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userID]);

  /**
   * Memoized list of upcoming tasks: not completed, not deadlines,
   * and start date is in the future (or estimated without a start date).
   */
  const upcomingTasks = useMemo(() => {
    const now = dayjs();
    return tasks
      .filter(
        (task) =>
          !task.completed &&
          !task.isDeadline &&
          ((task.isEstimated &&
            (!task.taskStart || task.taskStart.isAfter(now))) ||
            (!task.isEstimated &&
              task.taskStart &&
              task.taskStart.isAfter(now))),
      )
      .sort((a, b) => {
        const aTime = a.taskStart ? a.taskStart.valueOf() : Infinity;
        const bTime = b.taskStart ? b.taskStart.valueOf() : Infinity;
        return aTime - bTime;
      });
  }, [tasks]);

  /**
   * Memoized list of tasks with deadlines that haven't passed yet.
   */
  const deadlineTasks = useMemo(() => {
    const now = dayjs();
    return tasks
      .filter(
        (task) => task.isDeadline && task.taskEnd && task.taskEnd.isAfter(now),
      )
      .sort((a, b) => a.taskEnd.valueOf() - b.taskEnd.valueOf());
  }, [tasks]);

  /**
   * Memoized list of past tasks: completed tasks, or tasks whose time/deadline has passed.
   */
  const pastTasks = useMemo(() => {
    const now = dayjs();
    return tasks.filter((task) => {
      if (task.completed) return true;
      if (!task.isDeadline && task.taskStart && task.taskStart.isBefore(now))
        return true;
      if (task.isDeadline && task.taskEnd && task.taskEnd.isBefore(now))
        return true;
      return false;
    });
  }, [tasks]);

  /**
   * Delete selected tasks via backend and update local state.
   * @param {Array<string>} taskIDs - IDs of tasks to delete
   */
  const deleteTasks = async (taskIDs) => {
    try {
      // Axios delete supports sending a request body via "data"
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/tasks/delete`, {
        data: { taskIDs: taskIDs },
      });

      // Remove deleted tasks from state
      setTasks((prevTasks) =>
        prevTasks.filter((task) => !taskIDs.includes(task.taskID)),
      );
    } catch (error) {
      console.error("Error deleting tasks:", error);
      setError(error);
    }
  };

  /**
   * Mark selected tasks as complete via backend and update local state.
   * @param {Array<string>} taskIDs - IDs of tasks to mark complete
   */
  const markComplete = async (taskIDs) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/tasks/complete`,
        {
          taskIDs,
          setComplete: true,
        },
      );

      if (response.status === 200) {
        // Update tasks in state to reflect completion
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            taskIDs.includes(task.taskID) ? { ...task, completed: true } : task,
          ),
        );
      } else {
        console.error("Error marking tasks complete:", response.data);
      }
    } catch (error) {
      console.error("Error marking tasks complete:", error);
    }
  };

  // Display loading indicator overlay while fetching data
  if (loading) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.7)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingIndicator />
      </Box>
    );
  }

  // Display error message if data fetch failed
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  // Main UI: three tables for upcoming, deadline, and completed tasks
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography level="h1" component="h1" sx={{ fontWeight: "bold", p: 2 }}>
        Work To Do
      </Typography>
      <Grid container marginLeft={4} spacing={2} marginRight={4}>
        <Grid size={12}>
          <UpcomingTable
            tasks={upcomingTasks}
            deleteTasks={deleteTasks}
            markComplete={markComplete}
          />
        </Grid>
        <Grid size={12}>
          <DeadlineTable tasks={deadlineTasks} deleteTasks={deleteTasks} />
        </Grid>
        <Grid size={12}>
          <CompletedTable
            tasks={pastTasks}
            deleteTasks={deleteTasks}
            markComplete={markComplete}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Work;
