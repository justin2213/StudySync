import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

/**
 * GradeInformationForm
 *
 * Renders a form for entering or editing grade details:
 * - Optionally selects semester, class, and category when not on the grade page
 * - Input for assignment name
 * - Numeric fields for score and max points
 *
 * Props:
 * @param {Array<object>} semesters      - List of semester objects with classes
 * @param {object} grade                  - Current grade state: { semesterID, classID, categoryID, assignmentName, score, maxScore }
 * @param {function} setGrade             - Setter function to update grade state
 * @param {string|null} formError         - Current validation error key
 * @param {object} errors                 - Mapping of error keys to messages
 * @param {boolean} fromGradePage         - If true, semester/class/category selectors are hidden
 *
 * @component
 * @returns {JSX.Element} The grade information input form
 */
function GradeInformationForm({
  semesters,
  grade,
  setGrade,
  formError,
  errors,
  fromGradePage,
}) {
  // Handle changes to the assignment name field
  const handleNameChange = (e) => {
    const value = e.target.value;
    setGrade((prevState) => ({
      ...prevState,
      assignmentName: value,
    }));
  };

  // Handle changes to the semester selector
  const handleSemesterChange = (e) => {
    setGrade((prevState) => ({
      ...prevState,
      semesterID: e.target.value,
      classID: null, // Reset class when semester changes
    }));
  };

  // Handle changes to the class selector
  const handleClassChange = (e) => {
    setGrade((prevState) => ({
      ...prevState,
      classID: e.target.value,
    }));
  };

  // Handle changes to the category selector
  const handleCategoryChange = (e) => {
    setGrade((prevState) => ({
      ...prevState,
      categoryID: e.target.value,
    }));
  };

  // Handle changes to the score input
  const handleScoreChange = (e) => {
    const value = e.target.value;
    setGrade((prevState) => ({
      ...prevState,
      score: value,
    }));
  };

  // Handle changes to the max score input
  const handleMaxScoreChange = (e) => {
    const value = e.target.value;
    setGrade((prevState) => ({
      ...prevState,
      maxScore: value,
    }));
  };

  // Determine classes available for the selected semester
  const selectedSemester = semesters.find(
    (semester) => semester.semesterID === grade.semesterID,
  );
  const classesForSelectedSemester = selectedSemester?.classes || [];

  // Determine available categories for the selected class
  const selectedClass =
    selectedSemester?.classes?.find(
      (classInfo) => classInfo.classID === grade.classID,
    ) || null;
  const gradeDistributionForClass = selectedClass?.grade_distribution || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Form header */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", mb: 1 }}>
        Grade Information
      </Typography>
      {/* Container grid for form fields */}
      <Grid container spacing={3} marginTop={3} marginLeft={2} marginRight={1}>
        <Grid size={11}>
          <Stack direction="column" spacing={3}>
            {/* Conditionally render selectors when not on grade page */}
            {!fromGradePage && (
              <>
                {/* Semester selector */}
                <FormControl
                  error={formError === errors.SEMESTER}
                  variant="outlined"
                >
                  <InputLabel id="Semester-Label">
                    {formError === errors.SEMESTER ? formError : "Semester"}
                  </InputLabel>
                  <Select
                    labelId="Semester-Label"
                    id="semester-select"
                    label={
                      formError === errors.SEMESTER ? formError : "Semester"
                    }
                    value={grade.semesterID || ""}
                    onChange={handleSemesterChange}
                  >
                    {semesters.map((semester, index) => (
                      <MenuItem key={index} value={semester.semesterID}>
                        {semester.semesterName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Class selector */}
                <FormControl
                  error={formError === errors.CLASS}
                  variant="outlined"
                >
                  <InputLabel id="Class-Label">
                    {formError === errors.CLASS ? formError : "Class"}
                  </InputLabel>
                  <Select
                    labelId="Class-Label"
                    id="class-select"
                    label={formError === errors.CLASS ? formError : "Class"}
                    value={grade.classID || ""}
                    onChange={handleClassChange}
                  >
                    {classesForSelectedSemester.map((classInfo, index) => (
                      <MenuItem key={index} value={classInfo.classID}>
                        {classInfo.className}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Category selector */}
                <FormControl
                  error={formError === errors.CATEGORY}
                  variant="outlined"
                >
                  <InputLabel id="Category-Label">
                    {formError === errors.CATEGORY ? formError : "Category"}
                  </InputLabel>
                  <Select
                    labelId="Category-Label"
                    id="category-select"
                    label={
                      formError === errors.CATEGORY ? formError : "Category"
                    }
                    value={grade.categoryID || ""}
                    onChange={handleCategoryChange}
                  >
                    {gradeDistributionForClass.map((distInfo, index) => (
                      <MenuItem key={index} value={distInfo.categoryID}>
                        {distInfo.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            {/* Assignment name input */}
            <TextField
              autoComplete="off"
              error={formError === errors.ASSIGNMENT_NAME}
              label={
                formError === errors.ASSIGNMENT_NAME
                  ? formError
                  : "Assignment Name"
              }
              value={grade.assignmentName}
              onChange={handleNameChange}
            />
            {/* Score and Max Points inputs */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
            >
              <TextField
                type="number"
                error={formError === errors.SCORE}
                label={formError === errors.SCORE ? formError : "Your Score"}
                size="small"
                onChange={handleScoreChange}
              />
              <Typography variant="body1">/</Typography>
              <TextField
                type="number"
                error={formError === errors.MAX_SCORE}
                label={
                  formError === errors.MAX_SCORE ? formError : "Max Points"
                }
                size="small"
                onChange={handleMaxScoreChange}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GradeInformationForm;
