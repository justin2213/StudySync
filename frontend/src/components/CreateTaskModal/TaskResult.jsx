// Import Typography component for rendering text with various typographic styles
import Typography from "@mui/joy/Typography";
// Box provides a wrapper component for CSS utility props (e.g., layout, spacing)
import Box from "@mui/material/Box";
// Stack arranges its children in a vertical or horizontal stack with spacing
import Stack from "@mui/material/Stack";
// CircularProgress shows a loading spinner
import CircularProgress from "@mui/material/CircularProgress";
// Color helpers for success (green) and error (red) states
import { green, red } from "@mui/material/colors";
// Icon indicating a cancelled or failed action
import CancelIcon from "@mui/icons-material/Cancel";
// Floating Action Button for prominent actions
import Fab from "@mui/material/Fab";
// Icon indicating a successful action
import CheckIcon from "@mui/icons-material/Check";

/**
 * TaskResult
 *
 * A visual status indicator for task creation results:
 * - Displays a loading spinner when the creation request is in progress.
 * - Upon completion, shows a success (check) or failure (cancel) icon.
 * - Provides a corresponding message below the icon.
 *
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether the task creation request is currently loading.
 * @param {boolean} props.success   - True if the task creation succeeded; false if it failed.
 * @returns {JSX.Element} The UI element representing the task creation status.
 */
function TaskResult({ isLoading, success }) {
  // Styles for the Floating Action Button:
  // - Green when successful, red when failed
  // - Darkens color on hover for visual feedback
  const buttonSx = {
    bgcolor: success === true ? green[500] : red[500],
    "&:hover": {
      bgcolor: success === true ? green[700] : red[700],
    },
  };

  return (
    <Box
      // Container fills available space and centers its content
      sx={{
        flexGrow: 1,
        height: 300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box>
        {/* While loading, show a green spinner */}
        {isLoading ? (
          <CircularProgress size={68} sx={{ color: green[500] }} />
        ) : (
          /* Once loading is done, display status icon and message */
          <Stack
            // Stack aligns children vertically and centers them
            sx={{ marginTop: 1, alignItems: "center" }}
            spacing={1}
          >
            {/* Floating action button showing either Check or Cancel icon */}
            <Fab aria-label="status" color="primary" sx={buttonSx}>
              {success ? <CheckIcon /> : <CancelIcon />}
            </Fab>

            {/* Message indicating result of the creation */}
            <Typography level="h4">
              {success ? "Successfully created" : "Failed to Create"}
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default TaskResult;
