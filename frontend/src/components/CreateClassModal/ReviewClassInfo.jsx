import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

/**
 * ReviewClassInfo
 *
 * Displays a summary of class details for final review:
 * - Class Name, Semester, Start Time, End Time, and Days of Week
 * - Grade Distribution table with categories and their weights
 *
 * Props:
 * @param {object} props
 * @param {object} props.classInfo - The class data to display, including:
 *   @property {string} classInfo.className
 *   @property {object|string} classInfo.classSemester - Semester object or name based on availability
 *   @property {dayjs.Dayjs} classInfo.classStart
 *   @property {dayjs.Dayjs} classInfo.classEnd
 *   @property {string[]} classInfo.classDays
 *   @property {{category: string, weight: number}[]} classInfo.gradeDistribution
 * @param {boolean} props.semesterDisabled - If true, display raw semester string instead of object
 *
 * @component
 * @returns {JSX.Element} A view-only layout of class information
 */
function ReviewClassInfo({ classInfo, semesterDisabled }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Section title */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", p: 1 }}>
        Review Class
      </Typography>
      {/* Main grid layout dividing into three columns */}
      <Grid container spacing={2} marginLeft={4} marginTop={2}>
        {/* Column 1: Name, Semester, Start Time */}
        <Grid item size={3}>
          <Stack spacing={3}>
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Class Name
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {classInfo.className}
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Class Semester
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {semesterDisabled
                  ? classInfo.classSemester
                  : classInfo.classSemester.semesterName}
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Class Start
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {classInfo.classStart.format("h:mm A")}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* Column 2: End Time, Days of Week */}
        <Grid item size={3}>
          <Stack spacing={3}>
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Class End
              </Typography>
              <Typography level="body-md" sx={{ paddingLeft: 2 }}>
                {classInfo.classEnd.format("h:mm A")}
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <Typography level="title-md" fontWeight={"bold"}>
                Class Days
              </Typography>
              <Stack sx={{ paddingLeft: 2 }}>
                {/* List each day on its own line */}
                {classInfo.classDays.map((day, index) => (
                  <Typography key={index} level="body-xs">
                    {day}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Grid>
        {/* Column 3: Grade Distribution Table */}
        <Grid item size={6}>
          <Stack spacing={3}>
            <Typography level="title-md" fontWeight={"bold"}>
              Grade Distribution
            </Typography>
            <Box sx={{ paddingLeft: 2 }}>
              {/* Scrollable container for the table */}
              <TableContainer
                component={Paper}
                sx={{ maxWidth: 300, maxHeight: 220, borderRadius: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: "primary.main", color: "white" }}
                    >
                      <TableCell
                        align="center"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Category
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Weight
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Render each distribution entry as a table row */}
                    {classInfo.gradeDistribution.map((grade, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "rgba(0, 0, 0, 0.04)" : "white",
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          align="center"
                          sx={{ padding: "8px 12px" }}
                        >
                          {grade.category}
                        </TableCell>
                        <TableCell align="center" sx={{ padding: "8px 12px" }}>
                          {grade.weight}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ReviewClassInfo;
