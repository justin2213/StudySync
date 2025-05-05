// Core React import and hooks
import * as React from "react";
import { useState } from "react";
// Styling utility to create custom-styled table cells and rows
import { styled } from "@mui/material/styles";
// Table components
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
// Input and button components
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
// Modal for delete confirmation
import ConfirmationModal from "../ConfirmationModal";
// HTTP client for API calls
import axios from "axios";

// Styled table cell with custom header and body styles
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

// Styled table row with striped background and hidden last border
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

/**
 * calculatePercentage
 *
 * Calculates the percentage of a score relative to its maximum,
 * ensuring valid numeric input and avoiding division by zero.
 *
 * @param {string|number} score - The obtained score.
 * @param {string|number} maxScore - The maximum possible score.
 * @returns {string} Percentage formatted to two decimal places.
 */
function calculatePercentage(score, maxScore) {
  const s = parseFloat(score);
  const m = parseFloat(maxScore);
  // Validate inputs
  if (isNaN(s) || isNaN(m) || m === 0 || s < 0 || m < 0) {
    return "0.00";
  }
  const percent = (s / m) * 100;
  // Handle non-finite or negative results
  if (!isFinite(percent) || percent < 0) {
    return "0.00";
  }
  return percent.toFixed(2);
}

/**
 * AssignmentRowContent
 *
 * Renders a table row for a single assignment grade. Supports two modes:
 * - Read-only: displays assignment name, score, max points, and percentage.
 * - "What-if" editing: allows inline editing of name, score, and max points,
 *   updating local state without persisting.
 *
 * Includes a delete button that:
 * - Immediately updates local state in what-if mode.
 * - Opens a confirmation modal in normal mode, then issues a DELETE API call.
 *
 * @param {Object} props
 * @param {Object} props.gradeInfo - Data for the assignment ({ gradeID, assignmentName, score, maxScore }).
 * @param {boolean} props.isWhatIf - Whether the component is in what-if editing mode.
 * @param {Function} props.setWhatIfGrades - Setter for updating the what-if grades array.
 * @param {number} props.categoryIndex - Index of the grade's category in the grades array.
 * @param {number} props.gradeIndex - Index of this grade within its category.
 * @param {Function} props.fetchClassData - Callback to refresh data after deletion.
 *
 * @returns {JSX.Element} A fragment containing a styled table row and optional confirmation modal.
 */
function AssignmentRowContent({
  gradeInfo,
  isWhatIf,
  setWhatIfGrades,
  categoryIndex,
  gradeIndex,
  fetchClassData,
}) {
  // Local state to control the confirmation modal visibility
  const [showConfirm, setShowConfirm] = useState(false);

  // Text displayed in confirmation modal
  const confirmText =
    "Are you sure you wish to Delete? This action cannot be undone.";

  // Show the confirmation modal
  const handleShowConfirm = () => {
    setShowConfirm(true);
  };

  /**
   * handleFinish
   * Called when deletion is confirmed. Sends DELETE request,
   * updates local state or fetches fresh data, then closes modal.
   */
  const handleFinish = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/grades/${gradeInfo.gradeID}`,
      );
      if (isWhatIf) {
        // Remove grade locally in what-if mode
        setWhatIfGrades((prev) => {
          const updated = [...prev];
          const filtered = updated[categoryIndex].grades.filter(
            (_, i) => i !== gradeIndex,
          );
          updated[categoryIndex] = {
            ...updated[categoryIndex],
            grades: filtered,
          };
          return updated;
        });
      }
      // Refresh data from server
      fetchClassData();
    } catch (error) {
      console.error(
        "Error deleting grade:",
        error.response?.data || error.message,
      );
    } finally {
      setShowConfirm(false);
    }
  };

  // Close the confirmation modal without deleting
  const handleCloseConfirm = () => {
    setShowConfirm(false);
  };

  // Handlers for inline editing in what-if mode
  const handleNameChange = (newName) => {
    setWhatIfGrades((prev) => {
      const updated = [...prev];
      const gradesCopy = [...updated[categoryIndex].grades];
      gradesCopy[gradeIndex] = {
        ...gradesCopy[gradeIndex],
        assignmentName: newName,
      };
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        grades: gradesCopy,
      };
      return updated;
    });
  };

  const handleScoreChange = (newScore) => {
    setWhatIfGrades((prev) => {
      const updated = [...prev];
      const gradesCopy = [...updated[categoryIndex].grades];
      gradesCopy[gradeIndex] = { ...gradesCopy[gradeIndex], score: newScore };
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        grades: gradesCopy,
      };
      return updated;
    });
  };

  const handleMaxScoreChange = (newMaxScore) => {
    setWhatIfGrades((prev) => {
      const updated = [...prev];
      const gradesCopy = [...updated[categoryIndex].grades];
      gradesCopy[gradeIndex] = {
        ...gradesCopy[gradeIndex],
        maxScore: newMaxScore,
      };
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        grades: gradesCopy,
      };
      return updated;
    });
  };

  // Handler for clicking the delete icon
  const handleGradeDelete = () => {
    if (isWhatIf) {
      // Immediate remove in what-if
      setWhatIfGrades((prev) => {
        const updated = [...prev];
        const filtered = updated[categoryIndex].grades.filter(
          (_, i) => i !== gradeIndex,
        );
        updated[categoryIndex] = {
          ...updated[categoryIndex],
          grades: filtered,
        };
        return updated;
      });
    } else {
      // Show confirmation before server delete
      handleShowConfirm();
    }
  };

  return (
    <>
      {/* Render a styled table row with assignment data */}
      <StyledTableRow>
        <StyledTableCell component="th" scope="row">
          {isWhatIf ? (
            <TextField
              size="small"
              label="Assignment Name"
              value={gradeInfo.assignmentName}
              variant="standard"
              onChange={(e) => handleNameChange(e.target.value)}
              inputProps={{ style: { padding: "0px" } }}
            />
          ) : (
            gradeInfo.assignmentName
          )}
        </StyledTableCell>
        <StyledTableCell align="right">
          {isWhatIf ? (
            <TextField
              size="small"
              label="Score"
              value={gradeInfo.score}
              variant="standard"
              onChange={(e) => handleScoreChange(e.target.value)}
              inputProps={{ style: { padding: "0px" } }}
            />
          ) : (
            gradeInfo.score
          )}
        </StyledTableCell>
        <StyledTableCell align="right">
          {isWhatIf ? (
            <TextField
              size="small"
              label="Max Points"
              value={gradeInfo.maxScore}
              variant="standard"
              onChange={(e) => handleMaxScoreChange(e.target.value)}
              inputProps={{ style: { padding: "0px" } }}
            />
          ) : (
            gradeInfo.maxScore
          )}
        </StyledTableCell>
        <StyledTableCell align="right">
          {calculatePercentage(gradeInfo.score, gradeInfo.maxScore)}%
        </StyledTableCell>
        <StyledTableCell align="right">
          <IconButton aria-label="delete" onClick={handleGradeDelete}>
            <DeleteIcon color="error" />
          </IconButton>
        </StyledTableCell>
      </StyledTableRow>
      {/* Confirmation modal shown when deleting in normal mode */}
      <ConfirmationModal
        handleClose={handleCloseConfirm}
        open={showConfirm}
        text={confirmText}
        handleFinish={handleFinish}
        title={"Delete Grade"}
      />
    </>
  );
}

export default AssignmentRowContent;
