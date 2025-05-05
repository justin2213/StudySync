import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import CreateClassModal from "../CreateClassModal/CreateClassModal.jsx";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

/**
 * AddClassesForm
 *
 * Manages a list of classes within a semester:
 * - Displays existing classes in a scrollable list with delete buttons.
 * - Provides an "Add Class" floating action button that opens a modal to create a new class.
 * - On modal completion, appends the new class to the semester state.
 *
 * Props:
 * @param {object} semester             - The current semester object, containing a `classes` array.
 * @param {function} setSemester        - Setter to update the semester state.
 *
 * @component
 * @returns {JSX.Element} The classes list and add-class controls.
 */
function AddClassesForm({ semester, setSemester }) {
  // Controls visibility of the CreateClassModal
  const [show, setShow] = useState(false);

  /**
   * handleAdd
   *
   * Appends the newly created class info to the semester's classes array.
   * @param {object} classInfo - The class object returned from the modal
   */
  const handleAdd = (classInfo) => {
    setSemester((prevSemester) => ({
      ...prevSemester,
      classes: [...prevSemester.classes, classInfo],
    }));
  };

  /**
   * handleDelete
   *
   * Removes the class at the specified index from the semester's classes.
   * @param {number} index - Index of the class to remove
   */
  const handleDelete = (index) => {
    setSemester((prevState) => {
      const newClasses = prevState.classes.filter((_, i) => i !== index);
      return {
        ...prevState,
        classes: newClasses,
      };
    });
  };

  /**
   * handleShow
   *
   * Opens the CreateClassModal.
   */
  const handleShow = () => {
    setShow(true);
  };

  /**
   * handleClose
   *
   * Closes the CreateClassModal.
   */
  const handleClose = () => {
    setShow(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Section header */}
      <Typography level="title-lg" sx={{ fontWeight: "bold", p: 1 }}>
        Classes
      </Typography>
      {/* Main layout: list of classes and add-button icon */}
      <Grid container spacing={2} marginLeft={4} marginTop={2}>
        {/* List of existing classes with delete actions */}
        <Grid size={6}>
          <List sx={{ maxWidth: 250, maxHeight: 250, overflow: "auto" }}>
            {semester.classes.map((classInfo, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={classInfo.className} />
              </ListItem>
            ))}
          </List>
        </Grid>
        {/* Add Class FAB with icon */}
        <Grid
          size={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Stack spacing={1} sx={{ mt: -1 }}>
            {/* Decorative icon */}
            <AutoStoriesIcon sx={{ fontSize: 180 }} />
            {/* Floating action button to open modal */}
            <Fab variant="extended" color="primary" onClick={handleShow}>
              <SpeedDialIcon sx={{ mr: 1 }} />
              Add Class
            </Fab>
          </Stack>
        </Grid>
      </Grid>
      {/* Modal for creating a new class; disabled semester selection */}
      <CreateClassModal
        open={show}
        handleClose={handleClose}
        semesterDisabled={true}
        classSemester={semester.semesterName}
        finish={handleAdd}
      />
    </Box>
  );
}

export default AddClassesForm;
