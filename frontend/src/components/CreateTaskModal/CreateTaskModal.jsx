import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TaskInformationForm from "./TaskInformationForm.jsx";
import { useState } from "react";
import axios from "axios";
import TaskResult from "./TaskResult.jsx";
import { useSession } from "@supabase/auth-helpers-react";

const errors = {
  TASK_NAME: "Task Must Have a Name!",
  TASK_TYPE: "Task Must Have a Type!",
  TASK_CLASS: "Class Needed For Semester!",
  TASK_START: "Task must have start time!",
  TASK_END: "Task must have end time!",
  TASK_DEADLINE: "Deadline must be set!",
  TASK_ESTIMATION: "Estimation must be set!",
};

const steps = ["Semester Information", "Add Classes", "Review"];

/**
 * CreateTaskModal
 *
 * A modal dialog for creating a new task with validation and result display.
 * - Shows a form for entering task details (TaskInformationForm)
 * - Validates required fields before submission
 * - Submits new task to backend API
 * - Displays loading spinner and success/failure status (TaskResult)
 *
 * Props:
 * @param {function} handleClose - Callback to close the modal
 * @param {boolean} open         - Controls modal visibility
 *
 * @component
 * @returns {JSX.Element} The create-task modal UI
 */
function CreateTaskModal({ handleClose, open }) {
  // Submission success state (null = not submitted, true/false = result)
  const [success, setSuccess] = useState(null);
  // Loading indicator during submission
  const [isLoading, setIsLoading] = useState(false);
  // Supabase session for userID
  const session = useSession();
  const userID = session?.user?.id;
  // Local task form state
  const [task, setTask] = useState({
    taskName: "",
    taskDescription: "",
    taskType: "",
    taskSemester: null,
    taskClass: null,
    isDeadline: false,
    isEstimated: false,
    estimatedTime: "",
    taskStart: null,
    taskEnd: null,
  });
  // Form validation error state
  const [formError, setFormError] = useState(null);

  /**
   * handleCreateTask
   *
   * Posts the new task to the backend and updates success state.
   */
  const handleCreateTask = async () => {
    try {
      setIsLoading(true);
      const taskData = { ...task, userID: userID || "" };
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/tasks`,
        taskData,
      );
      setSuccess(true);
    } catch (error) {
      console.error(
        "Error creating task:",
        error.response?.data || error.message,
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleFinish
   *
   * Validates task fields and triggers create if valid.
   */
  const handleFinish = () => {
    if (task.taskName.length === 0) {
      setFormError(errors.TASK_NAME);
      return;
    } else if (task.taskType.length === 0) {
      setFormError(errors.TASK_TYPE);
      return;
    } else if (
      task.taskSemester &&
      task.taskSemester.length !== 0 &&
      (!task.taskClass || task.taskClass.length === 0)
    ) {
      setFormError(errors.TASK_CLASS);
      return;
    } else if (
      !task.isDeadline &&
      !task.isEstimated &&
      (task.taskStart === null || !task.taskStart.isValid())
    ) {
      setFormError(errors.TASK_START);
      return;
    } else if (
      !task.isDeadline &&
      !task.isEstimated &&
      (task.taskEnd === null || !task.taskEnd.isValid())
    ) {
      setFormError(errors.TASK_END);
      return;
    } else if (
      task.isDeadline &&
      (task.taskEnd === null || !task.taskEnd.isValid())
    ) {
      setFormError(errors.TASK_DEADLINE);
      return;
    } else if (task.isEstimated && task.estimatedTime.length === 0) {
      setFormError(errors.TASK_ESTIMATION);
      return;
    }

    // Clear error and proceed to create
    setFormError(null);
    handleCreateTask();
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
        <ModalClose variant="plain" sx={{ m: 1 }} />
        {/* Modal Title */}
        <Typography level="h3" sx={{ fontWeight: "bold", mb: 1 }}>
          Create Task
        </Typography>

        {/* Content area: form or result */}
        <Box
          sx={{ flexGrow: 1, paddingTop: 2, paddingLeft: 2, paddingRight: 2 }}
        >
          {isLoading || success !== null ? (
            <TaskResult isLoading={isLoading} success={success} />
          ) : (
            <TaskInformationForm
              task={task}
              setTask={setTask}
              formError={formError}
              errors={errors}
            />
          )}
        </Box>

        {/* Footer buttons: Cancel/Finish */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            mt: 2,
            pt: 2,
          }}
        >
          {success === null && (
            <>
              <Button color="inherit" onClick={handleClose}>
                Cancel
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleFinish}>Finish</Button>
            </>
          )}
        </Box>
      </Sheet>
    </Modal>
  );
}

export default CreateTaskModal;
