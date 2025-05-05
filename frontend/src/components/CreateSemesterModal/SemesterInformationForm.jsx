import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

/**
 * SemesterInformationForm
 *
 * Collects basic details for a semester:
 * - Semester name input
 * - Start and end date pickers
 *
 * Props:
 * @param {object} props                        - Component properties
 * @param {object} props.semester               - Semester state with properties:
 *   @property {string} semester.semesterName  - The name of the semester
 *   @property {dayjs.Dayjs} semester.semesterStart - The start date
 *   @property {dayjs.Dayjs} semester.semesterEnd   - The end date
 * @param {function} props.setSemester          - State setter for semester object
 * @param {string|null} props.formError         - Current validation error key
 * @param {object} props.errors                 - Mapping of error keys to messages
 *
 * @component
 * @returns {JSX.Element} The semester information form UI
 */
function SemesterInformationForm({ semester, setSemester, formError, errors }) {
  /**
   * handleNameChange
   *
   * Updates the semesterName when the text field changes.
   */
  const handleNameChange = (e) => {
    const value = e.target.value;
    setSemester((prevState) => ({ ...prevState, semesterName: value }));
  };

  /**
   * handleStartChange
   *
   * Updates the semesterStart when the date picker changes.
   */
  const handleStartChange = (newDate) => {
    setSemester((prevState) => ({ ...prevState, semesterStart: newDate }));
  };

  /**
   * handleEndChange
   *
   * Updates the semesterEnd when the date picker changes.
   */
  const handleEndChange = (newDate) => {
    setSemester((prevState) => ({ ...prevState, semesterEnd: newDate }));
  };

  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      noValidate
      autoComplete="off"
    >
      {/* Form title */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", p: 1 }}>
        Semester Information
      </Typography>
      {/* Grid layout for inputs */}
      <Grid container spacing={2} marginLeft={4} marginTop={1}>
        <Grid size={5}>
          <Box component="form">
            <Stack direction="column" spacing={4}>
              {/* Semester name input with validation error display */}
              <TextField
                error={formError === errors.SEMESTER_NAME}
                fullWidth
                label={
                  formError === errors.SEMESTER_NAME
                    ? formError
                    : "Semester Name"
                }
                variant="outlined"
                value={semester.semesterName}
                onChange={handleNameChange}
              />
              {/* Start date picker */}
              <DatePicker
                label="Semester Start Date"
                value={semester.semesterStart}
                onChange={handleStartChange}
                sx={{ width: "100%" }}
              />
              {/* End date picker with minDate constraint */}
              <DatePicker
                label={
                  formError === errors.SEMESTER_END
                    ? formError
                    : "Semester End Date"
                }
                value={semester.semesterEnd}
                onChange={handleEndChange}
                minDate={semester.semesterStart}
                sx={{ width: "100%" }}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SemesterInformationForm;
