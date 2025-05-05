// Import typography component for styled text
import Typography from "@mui/joy/Typography";
// Box provides a wrapper with styling props
import Box from "@mui/material/Box";
// Grid container for responsive layouts
import Grid from "@mui/material/Grid2";
// Stack arranges its children in a single direction with spacing
import Stack from "@mui/material/Stack";
// TextField for text input
import TextField from "@mui/material/TextField";
// InputLabel for Select components
import InputLabel from "@mui/material/InputLabel";
// MenuItem represents an option in Select
import MenuItem from "@mui/material/MenuItem";
// FormControl groups form fields and handles error states
import FormControl from "@mui/material/FormControl";
// Select dropdown component
import Select from "@mui/material/Select";
// Date and time picker component
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// React hooks for state and lifecycle
import { useState, useEffect } from "react";
// Hook for Supabase authentication session
import { useSession } from "@supabase/auth-helpers-react";
// HTTP client for API calls
import axios from "axios";
// Day.js for date manipulation
import dayjs from "dayjs";

/**
 * EditTaskInformationForm
 *
 * A form component for editing task details, including name, description,
 * type, associated semester and class, and start/end times. Fetches semesters
 * for the authenticated user and sorts them by ongoing status and start date.
 * Displays validation errors and supports toggling between view and edit modes.
 *
 * @param {Object} props
 * @param {Object} props.task - Current task state object with fields:
 *   taskName, taskDescription, taskType, taskSemester, taskClass,
 *   taskStart (Day.js), taskEnd (Day.js)
 * @param {Function} props.setTask - Setter function to update the task state.
 * @param {string|null} props.formError - Current validation error message key.
 * @param {Object} props.errors - Mapping of field keys to error messages.
 * @param {boolean} props.updating - Whether the form fields are editable.
 * @returns {JSX.Element} The form UI for editing task information.
 */
function EditTaskInformationForm({
  task,
  setTask,
  formError,
  errors,
  updating,
}) {
  // Local state: list of semesters fetched from backend
  const [semesters, setSemesters] = useState([]);
  // Local state: error during data fetch
  const [error, setError] = useState(null);
  // Supabase session hook for user authentication
  const session = useSession();
  // Loading state while fetching semesters
  const [loading, setLoading] = useState(false);
  // Extract user ID from session
  const userID = session?.user?.id;

  /**
   * Fetch semesters for the authenticated user when userID changes.
   * Converts date strings to Day.js objects and sorts semesters
   * so ongoing ones appear first, then by most recent start date.
   */
  useEffect(() => {
    if (!userID) return;

    const fetchSemesters = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/semesters/${userID}`,
        );

        // Format date fields into Day.js instances
        const formattedSemesters = response.data.map((semester) => ({
          ...semester,
          semesterStart: dayjs(semester.semesterStart),
          semesterEnd: dayjs(semester.semesterEnd),
          classes: semester.classes.map((classInfo) => ({
            ...classInfo,
            classStart: dayjs(classInfo.classStart, "HH:mm:ss"),
            classEnd: dayjs(classInfo.classEnd, "HH:mm:ss"),
          })),
        }));

        const now = dayjs();
        // Sort logic: ongoing first, then by start date descending
        const sortedSemesters = formattedSemesters.sort((a, b) => {
          const aOngoing =
            a.semesterStart.isBefore(now) && a.semesterEnd.isAfter(now);
          const bOngoing =
            b.semesterStart.isBefore(now) && b.semesterEnd.isAfter(now);
          if (aOngoing && !bOngoing) return -1;
          if (bOngoing && !aOngoing) return 1;
          return b.semesterStart.valueOf() - a.semesterStart.valueOf();
        });

        setSemesters(sortedSemesters);
      } catch (err) {
        setError(err.response?.data || "Error fetching semesters");
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, [userID]);

  // Handler for updating task name
  const handleNameChange = (e) => {
    const value = e.target.value;
    setTask((prev) => ({ ...prev, taskName: value }));
  };

  // Handler for updating task description
  const handleDescChange = (e) => {
    const value = e.target.value;
    setTask((prev) => ({ ...prev, taskDescription: value }));
  };

  // Handler for selecting task type
  const handleTypeChange = (e) => {
    setTask((prev) => ({ ...prev, taskType: e.target.value }));
  };

  // Handler for selecting semester; updates taskSemester and semesterName
  const handleSemesterChange = (e) => {
    const selectedId = e.target.value;
    const selected = semesters.find((s) => s.semesterID === selectedId);
    setTask((prev) => ({
      ...prev,
      taskSemester: selectedId,
      semesterName: selected?.semesterName || "",
    }));
  };

  // Handler for selecting class; updates taskClass and classTitle
  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    const selectedClass = classesForSelectedSemester.find(
      (c) => c.classID === selectedId,
    );
    setTask((prev) => ({
      ...prev,
      taskClass: selectedId,
      classTitle: selectedClass?.className || "",
    }));
  };

  // Handlers for date-time pickers
  const handleStartChange = (newStart) => {
    setTask((prev) => ({ ...prev, taskStart: newStart }));
  };
  const handleEndChange = (newEnd) => {
    setTask((prev) => ({ ...prev, taskEnd: newEnd }));
  };

  // Derive classes list from the selected semester
  const selectedSemester = semesters.find(
    (s) => s.semesterID === task.taskSemester,
  );
  const classesForSelectedSemester = selectedSemester?.classes || [];

  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      noValidate
      autoComplete="off"
    >
      {/* Form title */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", p: 1 }}>
        Task Information
      </Typography>
      {/* Grid layout for organizing form fields in three columns */}
      <Grid container spacing={2} marginLeft={4} marginRight={4} marginTop={1}>
        {/* Column 1: Name and Description */}
        <Grid size={4}>
          <Stack direction="column" spacing={4}>
            <TextField
              disabled={!updating}
              error={formError === errors.TASK_NAME}
              fullWidth
              label={formError === errors.TASK_NAME ? formError : "Task Name"}
              variant="outlined"
              value={task.taskName}
              onChange={handleNameChange}
            />
            <TextField
              disabled={!updating}
              label="Description (Optional)"
              multiline
              minRows={5}
              variant="outlined"
              fullWidth
              value={task.taskDescription}
              onChange={handleDescChange}
            />
          </Stack>
        </Grid>
        {/* Column 2: Type, Semester, Class selectors */}
        <Grid size={4}>
          <Stack direction="column" spacing={4}>
            <FormControl error={formError === errors.TASK_TYPE}>
              <InputLabel disabled={!updating} id="task-type-label">
                {formError === errors.TASK_TYPE ? formError : "Type"}
              </InputLabel>
              <Select
                disabled={!updating}
                labelId="task-type-label"
                value={task.taskType || ""}
                label={formError === errors.TASK_TYPE ? formError : "Type"}
                onChange={handleTypeChange}
              >
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel disabled={!updating} id="semester-label">
                Semester (Optional)
              </InputLabel>
              <Select
                disabled={!updating}
                labelId="semester-label"
                value={task.taskSemester || ""}
                label="Semester (Optional)"
                onChange={handleSemesterChange}
              >
                <MenuItem value="">None</MenuItem>
                {semesters.map((sem) => (
                  <MenuItem key={sem.semesterID} value={sem.semesterID}>
                    {sem.semesterName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl error={formError === errors.TASK_CLASS}>
              <InputLabel disabled={!updating} id="class-label">
                {formError === errors.TASK_CLASS
                  ? formError
                  : "Class (Optional)"}
              </InputLabel>
              <Select
                disabled={!updating}
                labelId="class-label"
                value={task.taskClass || ""}
                label={
                  formError === errors.TASK_CLASS
                    ? formError
                    : "Class (Optional)"
                }
                onChange={handleClassChange}
              >
                <MenuItem value="">None</MenuItem>
                {classesForSelectedSemester.map((cls) => (
                  <MenuItem key={cls.classID} value={cls.classID}>
                    {cls.className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        {/* Column 3: Start and End DateTimePickers */}
        <Grid size={4}>
          <Stack direction="column" spacing={4}>
            <DateTimePicker
              disabled={!updating}
              label={formError === errors.TASK_START ? formError : "Start Time"}
              value={task.taskStart}
              onChange={handleStartChange}
              slotProps={{
                textField: { error: formError === errors.TASK_START },
              }}
            />
            <DateTimePicker
              disabled={!updating}
              label={formError === errors.TASK_END ? formError : "End Time"}
              value={task.taskEnd}
              onChange={handleEndChange}
              slotProps={{
                textField: { error: formError === errors.TASK_END },
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EditTaskInformationForm;
