import { useState } from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import GradeIcon from "@mui/icons-material/Grade";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CreateSemesterModal from "./CreateSemesterModal/CreateSemesterModal.jsx";
import CreateClassModal from "./CreateClassModal/CreateClassModal.jsx";
import CreateGradeModal from "./CreateGradeModal/CreateGradeModal.jsx";
import CreateTaskModal from "./CreateTaskModal/CreateTaskModal.jsx";

/**
 * AddButton
 *
 * Floating action button with multiple SpeedDial actions to create new entities:
 * - Task
 * - Grade
 * - Class
 * - Semester
 *
 * Clicking an action opens the corresponding create modal.
 * Uses MUI SpeedDial for UI and manages open state for modals.
 *
 * @component
 * @returns {JSX.Element} The floating add button with creation modals
 */
function AddButton() {
  // State to control which modal is shown
  const [show, setShow] = useState(false);
  // The currently selected action name
  const [selectedAction, setSelectedAction] = useState(null);

  /**
   * handleShow
   *
   * Sets the selected action and opens its modal.
   * If the action name is unrecognized, logs a warning.
   *
   * @param {string} actionName - Name of the action clicked
   */
  const handleShow = (actionName) => {
    switch (actionName) {
      case "Semester":
      case "Class":
      case "Task":
      case "Grade":
        setSelectedAction(actionName);
        setShow(true);
        break;
      default:
        console.warn("Unknown action:", actionName);
    }
  };

  /**
   * handleClose
   *
   * Closes any open modal and resets selected action.
   */
  const handleClose = () => {
    setShow(false);
    setSelectedAction(null);
  };

  /**
   * List of actions for the SpeedDial menu.
   * Each action defines an icon and a name used to match a modal.
   */
  const actions = [
    { icon: <NoteAddIcon />, name: "Task" },
    { icon: <GradeIcon />, name: "Grade" },
    { icon: <ClassIcon />, name: "Class" },
    { icon: <SchoolIcon />, name: "Semester" },
  ];

  return (
    <>
      {/* Floating SpeedDial container */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <SpeedDial
          ariaLabel="Create actions"
          icon={<SpeedDialIcon />}
          direction="up"
          FabProps={{
            sx: {
              bgcolor: "#4652b7", // Initial purple color
              "&:hover": { bgcolor: "#3e4c92" }, // Darker on hover
            },
          }}
        >
          {/* Render each action as a SpeedDialAction */}
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => handleShow(action.name)}
            />
          ))}
        </SpeedDial>
      </Box>

      {/* Conditionally render the corresponding modal */}
      {selectedAction === "Semester" && (
        <CreateSemesterModal open={show} handleClose={handleClose} />
      )}
      {selectedAction === "Class" && (
        <CreateClassModal open={show} handleClose={handleClose} />
      )}
      {selectedAction === "Grade" && (
        <CreateGradeModal open={show} handleClose={handleClose} />
      )}
      {selectedAction === "Task" && (
        <CreateTaskModal open={show} handleClose={handleClose} />
      )}
    </>
  );
}

export default AddButton;
