import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { green, red } from "@mui/material/colors";
import CancelIcon from "@mui/icons-material/Cancel";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";

/**
 * SemesterResult
 *
 * Displays the outcome of a semester creation operation:
 * - Shows a loading spinner while the operation is in progress (isLoading=true).
 * - Upon completion, displays a green check icon for success or a red cancel icon for failure.
 * - Shows a success or failure message.
 *
 * Props:
 * @param {boolean} isLoading - Whether the semester creation request is currently loading.
 * @param {boolean} success   - True if the semester creation succeeded, false otherwise.
 *
 * @component
 * @returns {JSX.Element} The status indicator UI for semester creation.
 */
function SemesterResult({ isLoading, success }) {
  // Dynamic styles for the result button based on success/failure
  const buttonSx = {
    bgcolor: success === true ? green[500] : red[500],
    "&:hover": {
      bgcolor: success === true ? green[700] : red[700],
    },
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: 300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box>
        {/* Show spinner while loading */}
        {isLoading ? (
          <CircularProgress size={68} sx={{ color: green[500] }} />
        ) : (
          /* Show result icon and message when not loading */
          <Stack sx={{ marginTop: 1, alignItems: "center" }} spacing={1}>
            <Fab aria-label="status" color="primary" sx={buttonSx}>
              {success ? <CheckIcon /> : <CancelIcon />}
            </Fab>
            <Typography level="h4">
              {success ? "Successfully created" : "Failed to Create"}
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default SemesterResult;
