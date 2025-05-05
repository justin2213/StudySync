import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

/**
 * ReviewSemesterInfo
 *
 * Displays a read-only summary of a semester's details:
 * - Semester name, start date, and end date on the left column
 * - List of classes added to the semester on the right column
 *
 * Props:
 * @param {object} props
 * @param {object} props.semester - The semester data to review, containing:
 *   @property {string} semester.semesterName
 *   @property {dayjs.Dayjs} semester.semesterStart
 *   @property {dayjs.Dayjs} semester.semesterEnd
 *   @property {Array<{className: string}>} semester.classes
 *
 * @component
 * @returns {JSX.Element} A layout summarizing semester information
 */
function ReviewSemesterInfo({ semester }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Section header */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", p: 1 }}>
        Review Semester
      </Typography>
      {/* Grid layout: left for dates, right for class list */}
      <Grid container spacing={2} marginLeft={4} marginTop={2}>
        {/* Left column: semester name and dates */}
        <Grid size={6}>
          <Stack spacing={3}>
            {/* Semester Name */}
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Semester Name
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {semester.semesterName}
              </Typography>
            </Stack>
            {/* Semester Start Date */}
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Semester Start
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {semester.semesterStart.format("MMMM Do, YYYY")}
              </Typography>
            </Stack>
            {/* Semester End Date */}
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Semester End
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {semester.semesterEnd.format("MMMM Do, YYYY")}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* Right column: list of classes */}
        <Grid size={6}>
          <Stack>
            <Typography level="title-md" fontWeight={"bold"}>
              Classes
            </Typography>
            {/* Scrollable list of classes added to the semester */}
            <List sx={{ maxHeight: 230, overflow: "auto", paddingLeft: 2 }}>
              {semester.classes.map((classInfo, index) => (
                <ListItem key={index}>
                  <ListItemText primary={classInfo.className} />
                </ListItem>
              ))}
            </List>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ReviewSemesterInfo;
