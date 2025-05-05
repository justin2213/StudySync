// Typography component for styled text display
import Typography from "@mui/joy/Typography";
// Box provides a wrapper with layout and styling props
import Box from "@mui/material/Box";
// Stack arranges children in a vertical or horizontal layout with spacing
import Stack from "@mui/material/Stack";
// CircularProgress shows a loading spinner
import CircularProgress from "@mui/material/CircularProgress";
// Color utilities for success (green) and error (red) states
import { green, red } from "@mui/material/colors";
// Icon indicating a failed action
import CancelIcon from "@mui/icons-material/Cancel";
// Floating Action Button for prominent actions
import Fab from "@mui/material/Fab";
// Icon indicating a successful action
import CheckIcon from "@mui/icons-material/Check";

/**
 * TaskResult
 *
 * Displays the status of an update operation:
 * - Shows a loading spinner while the update is in progress.
 * - After loading completes, displays a success (check) or error (cancel) icon.
 * - Provides a corresponding message beneath the icon.
 *
 * @param {Object} props
 * @param {boolean} props.isLoading - True if the update request is currently in progress.
 * @param {boolean} props.success   - True if the update succeeded; false if it failed.
 * @returns {JSX.Element} The status indicator UI.
 */
function TaskResult({ isLoading, success }) {
  // Dynamic style for the floating action button based on update result
  const buttonSx = {
    bgcolor: success === true ? green[500] : red[500],
    "&:hover": {
      bgcolor: success === true ? green[700] : red[700],
    },
  };

  return (
    <Box
      // Container centers content horizontally and vertically within a fixed height
      sx={{
        flexGrow: 1,
        height: 300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box>
        {isLoading ? (
          // Show a green spinner while loading
          <CircularProgress size={68} sx={{ color: green[500] }} />
        ) : (
          // After loading, display the result icon and message
          <Stack sx={{ marginTop: 1, alignItems: "center" }} spacing={1}>
            <Fab aria-label="status" color="primary" sx={buttonSx}>
              {success ? <CheckIcon /> : <CancelIcon />}
            </Fab>
            <Typography level="h4">
              {success ? "Successfully updated" : "Failed to Update"}
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default TaskResult;
