import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { green, red } from "@mui/material/colors";
import CancelIcon from "@mui/icons-material/Cancel";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";

/**
 * GradeResult Component
 *
 * Displays the outcome of a grading operation. Shows a loading spinner while
 * the process is running, and upon completion, renders either a success or
 * failure indicator with an accompanying message.
 *
 * Props:
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether the grading operation is in progress.
 * @param {boolean} props.success - Whether the grading operation succeeded.
 * @param {string} props.error - Error message to display upon failure.
 * @param {boolean} props.fromGradePage - If true, adjusts container height for the grading page layout.
 */
function GradeResult({ isLoading, success, error, fromGradePage }) {
  // Styles for the action button, green on success, red on failure
  const buttonSx = {
    bgcolor: success === true ? green[500] : red[500],
    "&:hover": {
      bgcolor: success === true ? green[700] : red[700],
    },
  };

  return (
    // Outer container: centers content and adjusts height based on context
    <Box
      sx={{
        flexGrow: 1,
        height: fromGradePage ? 200 : 400, // dynamic height for different layouts
        display: "flex",
        marginLeft: -2,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box>
        {isLoading ? (
          // Show a circular progress indicator while loading
          <CircularProgress
            size={68}
            sx={{
              color: green[500],
            }}
          />
        ) : (
          // Display result: icon button and status text
          <Stack sx={{ marginTop: 1, alignItems: "center" }} spacing={1}>
            <Fab aria-label="save" color="primary" sx={buttonSx}>
              {/* Success shows a check icon; failure shows a cancel icon */}
              {success ? <CheckIcon /> : <CancelIcon />}
            </Fab>
            <Typography level="h4">
              {/* Display success message or provided error text */}
              {success ? "Successfully created" : error}
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default GradeResult;
