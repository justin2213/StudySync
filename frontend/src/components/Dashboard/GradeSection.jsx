// Core React import
import * as React from "react";
// Hook for accessing Material UI theme
import { useTheme } from "@mui/material/styles";
// Stepper component for mobile form navigation
import MobileStepper from "@mui/material/MobileStepper";
// Typography component for text rendering
import Typography from "@mui/joy/Typography";
// Box component for layout and styling
import Box from "@mui/material/Box";
// Sheet component for outlined container
import Sheet from "@mui/joy/Sheet";
// IconButton for clickable icons
import IconButton from "@mui/material/IconButton";
// Left arrow icon for navigation
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// Right arrow icon for navigation
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// Gauge chart and classes for displaying grades
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
// RouterLink for navigation between routes
import { Link as RouterLink } from "react-router-dom";
// Stack for arranging items in a row or column
import Stack from "@mui/material/Stack";

/**
 * GradeSection
 *
 * A component to display grade overviews for multiple semesters.
 * - Renders a stepper to navigate between semesters.
 * - Displays semester name in a clickable header linking to /classes.
 * - Shows each class's total grade as a gauge chart.
 * - Colors gauge based on grade thresholds.
 *
 * @param {Object[]} grades - List of semesters to display. Each semester object includes:
 *   {string} semesterName - Label for the semester.
 *   {Object[]} classes - List of class info:
 *     {string|number} classID - Unique ID.
 *     {string} className - Name of the class.
 *     {number} totalGrade - Grade percentage (0–100).
 * @returns {JSX.Element}
 */
export default function GradeSection({ grades = [] }) {
  // Access the current theme for possible styling use
  const theme = useTheme();
  // State to track the currently viewed semester index
  const [activeStep, setActiveStep] = React.useState(0);

  // If no semester data, render a fallback message
  if (!grades.length) {
    return <Typography level="body1">No semesters to show.</Typography>;
  }

  // Determine the semester data for the current active step
  const viewedSemester = grades[activeStep];

  // Handler to advance to the next semester, capping at the last index
  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, grades.length));
  };
  // Handler to move back to the previous semester, bottoming at index 0
  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  /**
   * Determines the color for the gauge arc based on a grade value.
   * - 0–75: Interpolates red (255,0,0) to dark yellow (255,200,0).
   * - 76–100: Interpolates dark yellow to dark green (0,200,0).
   *
   * @param {number} value - The grade percentage (0–100).
   * @returns {string} CSS rgb color string.
   */
  const getColorForValue = (value) => {
    value = Math.max(0, Math.min(value, 100));
    if (value <= 75) {
      const ratio = value / 75;
      const green = Math.round(ratio * 200);
      return `rgb(255, ${green}, 0)`;
    } else {
      const ratio = (value - 75) / 25;
      const red = Math.round(255 * (1 - ratio));
      return `rgb(${red}, 200, 0)`;
    }
  };

  // Main render
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      {/* Outlined sheet container */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          boxShadow: "lg",
          display: "flex",
          flexDirection: "column",
          minWidth: "100%",
          overflow: "clip",
        }}
      >
        {/* Semester header linking to classes overview */}
        <Box
          component={RouterLink}
          to="/classes"
          sx={{
            width: "100%",
            bgcolor: "#4652b7",
            cursor: "pointer",
            textAlign: "center",
            paddingY: 1,
            textDecoration: "none",
            "&:hover": {
              bgcolor: "#5462de",
            },
          }}
        >
          <Typography
            level="h3"
            sx={{ color: "#fff", m: 0 }} // white text, no extra margin
          >
            {viewedSemester.semesterName}
          </Typography>
        </Box>
        {/* Header section with navigation and class gauges */}
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* Back button */}
          <IconButton onClick={handleBack} disabled={activeStep === 0}>
            <ChevronLeftIcon fontSize="large" />
          </IconButton>

          {/* Scrollable container for class gauges */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflowX: "auto",
              display: "flex",
              alignItems: "center",
              paddingBottom: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={3}
              sx={{
                flexWrap: "nowrap",
              }}
            >
              {viewedSemester.classes.map((classInfo) => (
                // Each class gauge with link to class detail
                <Stack
                  component={RouterLink}
                  to={`/classes/${classInfo.classID}`}
                  key={classInfo.classID}
                  direction="column"
                  textAlign="center"
                  sx={{
                    gap: "1px",
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  <Gauge
                    width={100}
                    height={100}
                    value={classInfo.totalGrade}
                    margin={{ bottom: 0 }}
                    sx={{
                      [`& .${gaugeClasses.valueArc}`]: {
                        fill: getColorForValue(classInfo.totalGrade),
                      },
                    }}
                  />
                  <Typography
                    level="body-xs"
                    component="div"
                    sx={{
                      color: "inherit",
                      m: 0,
                    }}
                  >
                    {classInfo.className}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
          {/* Next button */}
          <IconButton onClick={handleNext} disabled={activeStep === 5}>
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        </Box>
        {/* Stepper indicator */}
        <MobileStepper
          variant="dots"
          steps={6}
          position="static"
          activeStep={activeStep}
          sx={{
            alignSelf: "center",
            mt: "auto",
            display: "flex",
          }}
        />
      </Sheet>
    </Box>
  );
}
