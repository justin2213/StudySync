import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

/**
 * ConfirmationModal
 *
 * A reusable modal dialog for confirming destructive or important actions.
 * Displays a title, descriptive text, and "Cancel" / "Delete" buttons.
 *
 * Props:
 * @param {boolean} open           - Whether the modal is open
 * @param {() => void} handleClose - Callback to close the modal without action
 * @param {string} title           - Header text displayed at the top
 * @param {string} text            - Main descriptive message
 * @param {() => void} handleFinish- Callback invoked to confirm the action
 *
 * @component
 * @returns {JSX.Element}
 */
function ConfirmationModal({ handleClose, open, text, handleFinish, title }) {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={handleClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      {/* Container sheet with outline and shadow */}
      <Sheet
        variant="outlined"
        sx={{
          minWidth: 200,
          minHeight: 200,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close button in corner */}
        <ModalClose variant="plain" sx={{ m: 1 }} />

        {/* Modal Title */}
        <Typography
          id="modal-title"
          level="h3"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          {title}
        </Typography>

        {/* Descriptive text area */}
        <Box sx={{ flexGrow: 1, pt: 2, pl: 2 }}>
          <Typography
            id="modal-desc"
            level="title-sm"
            sx={{ fontWeight: "bold" }}
          >
            {text}
          </Typography>
        </Box>

        {/* Action buttons: Cancel + Delete */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            mt: 2,
            pt: 2,
          }}
        >
          <Button color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button color="error" onClick={handleFinish}>
            Delete
          </Button>
        </Box>
      </Sheet>
    </Modal>
  );
}

export default ConfirmationModal;
