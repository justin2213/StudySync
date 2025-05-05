// Core React import and hook for component state
import * as React from "react";
import { useState } from "react";
// Material-UI styling utilities
import { styled } from "@mui/material/styles";
// Table components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// Row content component for individual assignments
import AssignmentRowContent from "./AssignmentRowContent";
// Button for actions like adding grades
import Button from "@mui/material/Button";
// Modal for creating a new grade
import CreateGradeModal from "../CreateGradeModal/CreateGradeModal";
// Typography for styled text when no grades
import Typography from "@mui/joy/Typography";

// StyledTableCell: custom cell styling for header and body
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Header cells: primary background, white text
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: 15,
  },
  // Body cells: font size, padding, and divider border
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

// StyledTableRow: striped and hoverable rows, no border on last row
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // Alternate row shading
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // Highlight on hover
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
  // Remove bottom border for last row
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

/**
 * GradeTable
 *
 * Renders a table of grade categories and their assignments.
 * - Displays each category header with name and weight.
 * - Lists assignments via AssignmentRowContent, supporting read-only and what-if modes.
 * - Provides an "Add Grade" button per category:
 *   - In what-if mode, adds a blank row inline.
 *   - Otherwise, opens a modal to create a grade on the backend.
 * - Shows a placeholder row if no grades are available.
 *
 * @param {Object[]} grades - Array of category objects:
 *   {string|number} categoryID, {string} categoryName, {number} weight, {Object[]} grades
 * @param {boolean} isWhatIf - Toggle for inline editing mode.
 * @param {Function} setWhatIfGrades - Setter for updating local what-if grades state.
 * @param {Function} fetchClassData - Callback to refresh grades from server.
 * @returns {JSX.Element} The grade table with modals and inline editing.
 */
function GradeTable({ grades, isWhatIf, setWhatIfGrades, fetchClassData }) {
  // State for controlling the create-grade modal visibility
  const [gradeModalShow, setGradeModalShow] = useState(false);
  // ID of category for which the modal is opened
  const [addGradeCategoryID, setAddGradeCategoryID] = useState(null);

  /**
   * handleShow
   * Opens the create-grade modal for a given category index.
   */
  const handleShow = (categoryIndex) => {
    setAddGradeCategoryID(grades[categoryIndex].categoryID);
    setGradeModalShow(true);
  };

  /**
   * handleClose
   * Closes the modal and optionally refreshes data on success.
   */
  const handleClose = (success) => {
    if (success) {
      fetchClassData();
    }
    setGradeModalShow(false);
    setAddGradeCategoryID(null);
  };

  /**
   * handleGradeAdd
   * Adds a blank grade row inline in what-if mode,
   * or opens the modal otherwise.
   */
  const handleGradeAdd = (categoryIndex) => {
    if (isWhatIf) {
      setWhatIfGrades((prevGrades) => {
        const updatedGrades = [...prevGrades];
        const updatedCategory = {
          ...updatedGrades[categoryIndex],
          grades: [
            ...updatedGrades[categoryIndex].grades,
            { assignmentName: "", score: "", maxScore: "" },
          ],
        };
        updatedGrades[categoryIndex] = updatedCategory;
        return updatedGrades;
      });
    } else {
      handleShow(categoryIndex);
    }
  };

  return (
    <>
      {/* Container with paper styling for rounded corners and shadow */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          {grades.map((grade, categoryIndex) => (
            <React.Fragment key={categoryIndex}>
              {/* Category header row */}
              <TableHead>
                <TableRow>
                  <StyledTableCell sx={{ width: "40%" }}>
                    {grade.categoryName} - {`${grade.weight}%`}
                  </StyledTableCell>
                  <StyledTableCell
                    sx={{ width: "15%" }}
                    align={isWhatIf ? "center" : "right"}
                  >
                    Score
                  </StyledTableCell>
                  <StyledTableCell
                    sx={{ width: "15%" }}
                    align={isWhatIf ? "center" : "right"}
                  >
                    Max Points
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: "15%" }} align="right">
                    Percentage
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: "15%" }} align="right">
                    Actions
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              {/* Body rows for each assignment or placeholder if empty */}
              <TableBody>
                {grade.grades.length > 0 ? (
                  grade.grades.map((gradeInfo, gradeIndex) => (
                    <AssignmentRowContent
                      key={gradeIndex}
                      gradeInfo={gradeInfo}
                      isWhatIf={isWhatIf}
                      setWhatIfGrades={setWhatIfGrades}
                      categoryIndex={categoryIndex}
                      gradeIndex={gradeIndex}
                      fetchClassData={fetchClassData}
                    />
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell align="center" colSpan={5}>
                      <Typography
                        level="title-sm"
                        sx={{ fontWeight: "bold", fontStyle: "italic", p: 4 }}
                      >
                        No Grades Available
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                )}
                {/* Row for adding a new grade */}
                <StyledTableRow>
                  <StyledTableCell align="center" colSpan={5} sx={{ py: 1 }}>
                    <Button
                      sx={{ textTransform: "uppercase", fontWeight: 600 }}
                      onClick={() => handleGradeAdd(categoryIndex)}
                    >
                      Add Grade
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </React.Fragment>
          ))}
        </Table>
      </TableContainer>

      {/* Modal for creating a new grade when not in what-if mode */}
      <CreateGradeModal
        open={gradeModalShow}
        handleClose={handleClose}
        fromGradePage={true}
        catID={addGradeCategoryID}
      />
    </>
  );
}

export default GradeTable;
