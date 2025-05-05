import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import axios from "axios";
import dayjs from "dayjs";

/**
 * TaskInformationForm is a React functional component that renders a form for creating or editing a task.
 *
 * This form includes inputs for:
 * - Task name and description.
 * - Task type selection (e.g., meeting, assignment, other).
 * - Optional association with a semester and class.
 * - Time controls where the task can either have a deadline or an estimated time.
 * - Date/time pickers for start and end times based on the selected time control option.
 *
 * The component fetches semester data from a backend service and converts the date fields to Day.js objects.
 * Semesters are then sorted so that currently ongoing semesters appear first, followed by others ordered by start date.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.task - The current task object containing properties like taskName, taskDescription, taskType, etc.
 * @param {Function} props.setTask - Function to update the task state.
 * @param {string|null} props.formError - The current error message for the form, if any.
 * @param {Object} props.errors - An object defining the various error types that can occur in the form.
 * @returns {JSX.Element} A JSX element representing the task information form.
 */
function TaskInformationForm({ task, setTask, formError, errors }) {
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState(null);
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const userID = session?.user?.id;

  useEffect(() => {
    if (!userID) return;

    const fetchSemesters = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/semesters/${userID}`,
        );

        // Convert all semester and class date fields back to Day.js objects
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

        // Sort so that ongoing semesters appear at the top,
        // then order by start date (descending) for the rest.
        const sortedSemesters = formattedSemesters.sort((a, b) => {
          const aIsOngoing =
            a.semesterStart.isBefore(now) && a.semesterEnd.isAfter(now);
          const bIsOngoing =
            b.semesterStart.isBefore(now) && b.semesterEnd.isAfter(now);

          // Place ongoing semesters first
          if (aIsOngoing && !bIsOngoing) return -1;
          if (bIsOngoing && !aIsOngoing) return 1;

          // For both ongoing or both not ongoing, sort by semester start date (most recent first)
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

  const handleNameChange = (e) => {
    const value = e.target.value;
    setTask((prevState) => ({
      ...prevState,
      taskName: value,
    }));
  };

  const handleDescChange = (e) => {
    const value = e.target.value;
    setTask((prevState) => ({
      ...prevState,
      taskDescription: value,
    }));
  };

  const handleTypeChange = (e) => {
    setTask((prevState) => ({
      ...prevState,
      taskType: e.target.value,
    }));
  };

  const handleSemesterChange = (e) => {
    setTask((prevState) => ({
      ...prevState,
      taskSemester: e.target.value,
    }));
  };

  const handleClassChange = (e) => {
    setTask((prevState) => ({
      ...prevState,
      taskClass: e.target.value,
    }));
  };

  const handleEstimatedTimeChange = (e) => {
    const value = e.target.value;
    setTask((prevState) => ({
      ...prevState,
      estimatedTime: value,
    }));
  };

  const handleStartChange = (newStart) => {
    setTask((prevState) => ({
      ...prevState,
      taskStart: newStart,
    }));
  };
  const handleEndChange = (newEnd) => {
    setTask((prevState) => ({
      ...prevState,
      taskEnd: newEnd,
    }));
  };

  // Derive the current radio group's value from the task state.
  const timeControlValue = task.isDeadline
    ? "deadline"
    : task.isEstimated
      ? "estimated"
      : "";

  // onChange updates state when selecting a different option.
  const handleTimeControlChange = (e) => {
    const newValue = e.target.value;
    setTask((prevState) => ({
      ...prevState,
      isDeadline: newValue === "deadline",
      isEstimated: newValue === "estimated",
    }));
  };

  // Find the selected semester based on the tasks semesterID
  const selectedSemester = semesters.find(
    (semester) => semester.semesterID === task.taskSemester,
  );
  const classesForSelectedSemester = selectedSemester?.classes || [];

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2, // Adds spacing between elements
      }}
      noValidate
      autoComplete="off"
    >
      <Typography level="title-lg" sx={{ fontWeight: "bold", p: 1 }}>
        Task Information
      </Typography>
      {/* Use Grid Layout for better alignment */}
      <Grid container spacing={2} marginLeft={4} marginRight={4} marginTop={1}>
        {/* First Column */}
        <Grid size={4}>
          <Stack direction="column" spacing={4}>
            <TextField
              error={formError === errors.TASK_NAME}
              fullWidth
              label={formError === errors.TASK_NAME ? formError : "Task Name"}
              variant="outlined"
              value={task.taskName}
              onChange={handleNameChange}
            />
            <TextField
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
        {/* Second Column */}
        <Grid size={4}>
          <Stack direction="column" spacing={4}>
            <FormControl
              error={formError === errors.TASK_TYPE}
              variant="outlined"
            >
              <InputLabel id="task-type-label">
                {formError === errors.TASK_TYPE ? formError : "Type"}
              </InputLabel>
              <Select
                labelId="task-type-label"
                id="task-type"
                value={task.taskType || ""}
                label={formError === errors.TASK_TYPE ? formError : "Type"}
                onChange={handleTypeChange}
              >
                <MenuItem key="meeting" value="meeting">
                  Meeting
                </MenuItem>
                <MenuItem key="assignment" value="assignment">
                  Assignment
                </MenuItem>
                <MenuItem key="other" value="other">
                  Other
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined">
              <InputLabel id="semester-label">
                {"Semester (Optional)"}
              </InputLabel>
              <Select
                labelId="semester-label"
                id="semester"
                value={task.taskSemester || ""}
                label="Semester (Optional)"
                onChange={handleSemesterChange}
              >
                <MenuItem value={""}>None</MenuItem>
                {semesters.length !== 0 ? (
                  semesters.map((semester, index) => (
                    <MenuItem key={index} value={semester.semesterID}>
                      {semester.semesterName}
                    </MenuItem>
                  ))
                ) : (
                  <></>
                )}
              </Select>
            </FormControl>
            <FormControl
              error={formError === errors.TASK_CLASS}
              variant="outlined"
            >
              <InputLabel id="class-label">
                {formError === errors.TASK_CLASS
                  ? formError
                  : "Class (Optional)"}
              </InputLabel>
              <Select
                labelId="class-Label"
                id="class-select"
                label={
                  formError === errors.TASK_CLASS
                    ? formError
                    : "Class (Optional)"
                }
                value={task.taskClass || ""}
                onChange={handleClassChange}
              >
                <MenuItem value={""}>None</MenuItem>
                {classesForSelectedSemester.map((classInfo, index) => (
                  <MenuItem key={index} value={classInfo.classID}>
                    {classInfo.className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        {/* Third Column */}
        <Grid size={4}>
          <Stack direction="column" spacing={4}>
            <Box
              sx={{
                minHeight: 56, // default TextField height
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FormControl>
                <RadioGroup
                  row
                  name="time-control"
                  value={timeControlValue}
                  onChange={handleTimeControlChange}
                >
                  <FormControlLabel
                    value="deadline"
                    control={
                      <Radio
                        onClick={() => {
                          // Toggle off if already selected.
                          if (timeControlValue === "deadline") {
                            setTask((prevState) => ({
                              ...prevState,
                              isDeadline: false,
                              isEstimated: false,
                            }));
                          }
                        }}
                      />
                    }
                    label="Deadline"
                  />
                  <FormControlLabel
                    value="estimated"
                    control={
                      <Radio
                        onClick={() => {
                          // Toggle off if already selected.
                          if (timeControlValue === "estimated") {
                            setTask((prevState) => ({
                              ...prevState,
                              isDeadline: false,
                              isEstimated: false,
                            }));
                          }
                        }}
                      />
                    }
                    label="Estimated Time"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            {task.isDeadline ? (
              <></>
            ) : (
              <DateTimePicker
                label={
                  formError === errors.TASK_START
                    ? formError
                    : `Start Time${task.isEstimated ? " (Optional)" : ""}`
                }
                value={task.taskStart}
                onChange={handleStartChange}
                slotProps={{
                  textField: {
                    error: formError === errors.TASK_START,
                  },
                }}
              />
            )}
            {task.isEstimated ? (
              <TextField
                error={formError === errors.TASK_ESTIMATION}
                fullWidth
                label={
                  formError === errors.TASK_ESTIMATION
                    ? formError
                    : "Duration (min)"
                }
                variant="outlined"
                value={task.estimatedTime}
                onChange={handleEstimatedTimeChange}
              />
            ) : (
              <DateTimePicker
                label={
                  task.isDeadline
                    ? formError === errors.TASK_DEADLINE
                      ? formError
                      : "Deadline"
                    : formError === errors.TASK_END
                      ? formError
                      : "End Time"
                }
                value={task.taskEnd}
                onChange={handleEndChange}
                slotProps={{
                  textField: {
                    error:
                      formError === errors.TASK_END ||
                      formError === errors.TASK_DEADLINE,
                  },
                }}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TaskInformationForm;
