import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { useSession } from "@supabase/auth-helpers-react";
import axios from "axios";

/**
 * ClassInformationForm
 *
 * Renders a form for creating or editing class details:
 * - Class name input
 * - Semester selector (optional disable)
 * - Start and end time pickers
 * - Day-of-week checkboxes
 *
 * Fetches available semesters for the current user via API.
 * Uses MUI components for layout & validation feedback.
 *
 * Props:
 * @param {object} classInfo            - Current form values
 * @param {function} setClassInfo       - Setter to update form values
 * @param {boolean} semesterDisabled    - Disable semester selector
 * @param {string|null} formError       - Current validation error key
 * @param {object} errors               - Mapping of error keys
 *
 * @component
 * @returns {JSX.Element} The class information form
 */
function ClassInformationForm({
  classInfo,
  setClassInfo,
  semesterDisabled,
  formError,
  errors,
}) {
  // State for loaded semesters from backend
  const [semesters, setSemesters] = useState([]);
  // Supabase session to identify user
  const session = useSession();
  const userID = session?.user?.id;
  // Loading and error state for API call
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch semesters when userID is available
  useEffect(() => {
    if (!userID) return;
    const fetchSemesters = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/semesters/${userID}`,
        );
        // Map API data to local format
        const formattedSemesters = response.data.map((semester) => ({
          semesterID: semester.semesterID,
          semesterName: semester.semesterName,
        }));
        setSemesters(formattedSemesters);
      } catch (err) {
        setError(err.response?.data || "Error fetching semesters");
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, [userID]);

  // Handlers for form field changes
  const handleSemesterChange = (e) => {
    setClassInfo((prev) => ({
      ...prev,
      classSemester: e.target.value,
    }));
  };

  const handleNameChange = (e) => {
    setClassInfo((prev) => ({ ...prev, className: e.target.value }));
  };

  const handleStartChange = (newTime) => {
    setClassInfo((prev) => ({ ...prev, classStart: newTime }));
  };

  const handleEndChange = (newTime) => {
    setClassInfo((prev) => ({ ...prev, classEnd: newTime }));
  };

  // Days of week order for sorting
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Toggle handler for day checkboxes
  const handleDaysChange = (day) => (e) => {
    setClassInfo((prev) => {
      let updatedDays = e.target.checked
        ? [...prev.classDays, day]
        : prev.classDays.filter((d) => d !== day);
      // Sort selected days by predefined order
      updatedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
      return { ...prev, classDays: updatedDays };
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Form title */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", mb: 1 }}>
        Class Information
      </Typography>
      {/* Main grid layout */}
      <Grid container spacing={6} marginLeft={4} marginTop={3}>
        {/* Left column: name, semester, start time */}
        <Grid item size={5}>
          <Stack direction="column" spacing={4}>
            {/* Class name input with error feedback */}
            <TextField
              autoComplete="off"
              label={formError === errors.CLASS_NAME ? formError : "Class Name"}
              error={formError === errors.CLASS_NAME}
              value={classInfo.className}
              onChange={handleNameChange}
            />
            {/* Semester selector */}
            <FormControl error={formError === errors.CLASS_SEMESTER}>
              <InputLabel>
                {formError === errors.CLASS_SEMESTER ? formError : "Semester"}
              </InputLabel>
              <Select
                disabled={semesterDisabled}
                value={classInfo.classSemester || ""}
                onChange={handleSemesterChange}
                label={
                  formError === errors.CLASS_SEMESTER ? formError : "Semester"
                }
              >
                {semesterDisabled ? (
                  <MenuItem value={classInfo.classSemester}>
                    {classInfo.classSemester}
                  </MenuItem>
                ) : semesters.length > 0 ? (
                  semesters.map((sem, idx) => (
                    <MenuItem key={idx} value={sem}>
                      {sem.semesterName}
                    </MenuItem>
                  ))
                ) : null}
              </Select>
            </FormControl>
            {/* Class start time picker */}
            <TimePicker
              label={
                formError === errors.CLASS_START
                  ? formError
                  : "Class Start Time"
              }
              value={classInfo.classStart}
              onChange={handleStartChange}
              slotProps={{
                textField: { error: formError === errors.CLASS_START },
              }}
            />
          </Stack>
        </Grid>
        {/* Right column: end time and days selection */}
        <Grid item size={5}>
          <Stack direction="column" spacing={4}>
            {/* Class end time picker */}
            <TimePicker
              label={
                formError === errors.CLASS_END ||
                formError === errors.CLASS_END_1
                  ? formError
                  : "Class End Time"
              }
              value={classInfo.classEnd}
              onChange={handleEndChange}
              slotProps={{
                textField: {
                  error:
                    formError === errors.CLASS_END ||
                    formError === errors.CLASS_END_1,
                },
              }}
            />
            {/* Days of week checkboxes */}
            <FormControl
              component="fieldset"
              error={formError === errors.CLASS_DAYS}
            >
              <FormLabel component="legend">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography level="body-md">Days of Week</Typography>
                  {formError === errors.CLASS_DAYS && (
                    <Typography level="body-xs" color="danger">
                      {` - ${formError}`}
                    </Typography>
                  )}
                </Stack>
              </FormLabel>
              <Stack direction="row" spacing={2} paddingLeft={4}>
                {/* Render checkboxes in three columns */}
                {Array.from({ length: 3 }).map((_, col) => (
                  <FormGroup key={col}>
                    {daysOfWeek.slice(col * 3, col * 3 + 3).map((day, idx) => (
                      <FormControlLabel
                        key={idx}
                        control={
                          <Checkbox
                            onChange={handleDaysChange(day)}
                            checked={classInfo.classDays.includes(day)}
                          />
                        }
                        label={day}
                      />
                    ))}
                  </FormGroup>
                ))}
              </Stack>
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClassInformationForm;
