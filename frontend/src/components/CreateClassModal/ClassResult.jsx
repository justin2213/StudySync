import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { green, red } from "@mui/material/colors";
import CancelIcon from "@mui/icons-material/Cancel";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";

/**
 * ClassResult
 *
 * Displays the result of a class creation operation:
 * - Shows a loading spinner while the operation is in progress.
 * - Shows a green check icon and success message upon success.
 * - Shows a red cancel icon and error message upon failure.
 *
 * Props:
 * @param {boolean} isLoading - Whether the creation operation is currently loading
 * @param {boolean} success   - Result of the creation operation (true = success, false = failure)
 *
 * @component
 * @returns {JSX.Element} The status indicator UI
 */
function ClassResult({ isLoading, success }) {
  // Shared styles for the result button based on success/failure
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
          /* Show result icon and message */
          <Stack sx={{ mt: 1, alignItems: "center" }} spacing={1}>
            <Fab aria-label="status" sx={buttonSx}>
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

export default ClassResult;
