// Modal component for overlay dialogs
import Modal from "@mui/joy/Modal";
// Close button for the modal
import ModalClose from "@mui/joy/ModalClose";
// Typography for styled text headings and body
import Typography from "@mui/joy/Typography";
// Sheet provides a bordered container with padding and shadow
import Sheet from "@mui/joy/Sheet";
// Box for layout and styling utilities
import Box from "@mui/material/Box";
// Button for user actions
import Button from "@mui/material/Button";
// Form component for editing task fields
import EditTaskInformationForm from "./EditTaskInformationForm.jsx";
// React hook for local component state
import { useState } from "react";
// Component to show loading/result state after saving
import TaskResult from "./TaskResult.jsx";
// HTTP client for API requests
import axios from "axios";

// Validation error messages for form fields
const errors = {
  TASK_NAME: "Task Must Have a Name!",
  TASK_TYPE: "Task Must Have a Type!",
  TASK_CLASS: "Class Needed For Semester!",
  TASK_START: "Task must have start time!",
  TASK_END: "Task must have end time!",
  TASK_DEADLINE: "Deadline must be set!",
  TASK_ESTIMATION: "Estimation must be set!",
};

/**
 * EditTaskModal
 *
 * A modal dialog for viewing and editing a task's details.
 * - Displays task form or result indicator based on save state.
 * - Validates required fields before submission.
 * - Supports marking a task complete/incomplete.
 *
 * Props:
 * @param {Object} task             - The task object being edited.
 * @param {Function} setTask        - State setter to update the task object.
 * @param {Function} handleClose    - Callback to close the modal.
 * @param {boolean} open            - Whether the modal is open.
 * @param {Function} markComplete   - Callback to mark task as complete.
 * @param {Function} markIncomplete - Callback to mark task as incomplete.
 * @param {Function} updateEvent    - Callback to propagate task updates externally.
 *
 * @returns {JSX.Element} The modal UI for editing or updating a task.
 */
function EditTaskModal({
  task,
  setTask,
  handleClose,
  open,
  markComplete,
  markIncomplete,
  updateEvent,
}) {
  // Local state to track success of update request (null = untouched)
  const [success, setSuccess] = useState(null);
  // Loading spinner flag during API calls
  const [isLoading, setIsLoading] = useState(false);
  // Toggle edit mode for the form
  const [updating, setUpdating] = useState(false);
  // Holds validation error key for rendering messages
  const [formError, setFormError] = useState(null);

  /**
   * handleFinish
   * Validates required task fields and triggers the update if valid.
   */
  const handleFinish = () => {
    // Validate name
    if (task.taskName.length === 0) {
      setFormError(errors.TASK_NAME);
      return;
      // Validate type
    } else if (task.taskType.length === 0) {
      setFormError(errors.TASK_TYPE);
      return;
      // Validate class when semester is selected
    } else if (
      task.taskSemester &&
      task.taskSemester.length !== 0 &&
      (!task.taskClass || task.taskClass.length === 0)
    ) {
      setFormError(errors.TASK_CLASS);
      return;
      // Validate start date
    } else if (task.taskStart === null || !task.taskStart.isValid()) {
      setFormError(errors.TASK_START);
      return;
      // Validate end date
    } else if (task.taskEnd === null || !task.taskEnd.isValid()) {
      setFormError(errors.TASK_END);
      return;
    }

    // Clear any previous error and proceed to update
    setFormError(null);
    handleUpdate();
  };

  /**
   * formatDurationToHHM
   * Converts total minutes to "HH:MM" format string with zero padding.
   * @param {number} totalMinutes - Duration in minutes.
   * @returns {string} Formatted duration string.
   */
  const formatDurationToHHM = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:
           ${String(minutes).padStart(2, "0")}`.replace(/\s+/g, "");
  };

  /**
   * handleUpdatingChange
   * Enables the form for editing.
   */
  const handleUpdatingChange = () => {
    setUpdating(true);
  };

  /**
   * handleUpdate
   * Sends an HTTP PUT to update the task, then calls updateEvent on success.
   */
  const handleUpdate = async () => {
    try {
      // Calculate duration in minutes
      const duration = task.taskEnd.diff(task.taskStart, "minute");
      // Send updated task to backend
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/tasks`,
        { ...task, duration },
      );
      if (response.status === 200) {
        // Build event object for calendar update
        const taskEvent = {
          id: task.taskID,
          title: task.taskName,
          description: task.taskDescription,
          type: task.taskType,
          isDeadline: false,
          isEstimated: false,
          duration: formatDurationToHHM(duration),
          start: task.taskStart.toISOString(),
          end: task.taskEnd.toISOString(),
          classID: task.taskClass,
          classTitle: task.classTitle,
          semesterID: task.taskSemester,
          semesterName: task.semesterName,
          completed: task.completed,
        };
        // Notify parent of the update
        updateEvent(taskEvent);
        setUpdating(false);
      }
    } catch (error) {
      // Mark as failure and log error
      setSuccess(false);
      console.error(
        "Error updating task:",
        error.response?.data || error.message,
      );
    }
  };

  /**
   * Handlers for marking task complete or incomplete.
   */
  const handleMarkComplete = () => {
    markComplete([task.taskID]);
    setTask((prev) => ({ ...prev, completed: true }));
  };
  const handleMarkIncomplete = () => {
    markIncomplete([task.taskID]);
    setTask((prev) => ({ ...prev, completed: false }));
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={handleClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          minWidth: 1000,
          minHeight: 400,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close icon in top-right corner */}
        <ModalClose variant="plain" sx={{ m: 1 }} />

        {/* Modal Title */}
        <Typography level="h3" sx={{ fontWeight: "bold", mb: 1 }}>
          Create Task
        </Typography>

        {/* Main Content: either form or result based on success flag */}
        <Box sx={{ flexGrow: 1, pt: 2, pl: 2, pr: 2 }}>
          {success === false ? (
            <TaskResult isLoading={isLoading} success={success} />
          ) : (
            <EditTaskInformationForm
              task={task}
              setTask={setTask}
              formError={formError}
              errors={errors}
              updating={updating}
            />
          )}
        </Box>

        {/* Footer Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            pt: 2,
          }}
        >
          {success === null && (
            <>
              {/* Cancel button always shown first */}
              <Button color="inherit" onClick={handleClose}>
                Cancel
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {updating ? (
                /* Save button when editing */
                <Button onClick={handleFinish}>Save</Button>
              ) : (
                /* Complete/Incomplete and Edit toggles when not editing */
                <>
                  {task.completed ? (
                    <Button onClick={handleMarkIncomplete}>Incomplete</Button>
                  ) : (
                    <Button onClick={handleMarkComplete}>Complete</Button>
                  )}
                  <Button onClick={handleUpdatingChange}>Edit</Button>
                </>
              )}
            </>
          )}
        </Box>
      </Sheet>
    </Modal>
  );
}

export default EditTaskModal;
