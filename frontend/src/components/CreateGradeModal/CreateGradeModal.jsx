import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import GradeInformationForm from "./GradeInformationForm";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import axios from "axios";
import GradeResult from "./GradeResult";

/**
 * CreateGradeModal
 *
 * A modal dialog that steps through creating a grade entry.
 * - Loads semesters unless opened from the Grade page
 * - Validates input fields (semester, class, category, assignment name, score, max score)
 * - Submits grade data to backend and shows result
 *
 * Props:
 * @param {function(boolean): void} handleClose - Callback invoked on modal close, receives success flag
 * @param {boolean} fromGradePage - If true, skips semester/class selection
 * @param {string|null} catID - Pre-selected category ID
 * @param {boolean} open - Controls modal visibility
 *
 * @component
 * @returns {JSX.Element} The create-grade modal UI
 */
function CreateGradeModal({ handleClose, fromGradePage, catID, open }) {
  // Form validation error state
  const [formError, setFormError] = useState(null);
  // Loaded semesters list
  const [semesters, setSemesters] = useState([]);
  // Loading indicator for fetching semesters
  const [loading, setLoading] = useState(true);
  // Error state for API errors
  const [error, setError] = useState(null);
  // Success flag for submission result
  const [success, setSuccess] = useState(false);
  // Submission-in-progress indicator
  const [submitting, setSubmitting] = useState(false);
  // Supabase session for user ID
  const session = useSession();
  // Local grade form state
  const [grade, setGrade] = useState({
    semesterID: null,
    classID: null,
    categoryID: null,
    assignmentName: "",
    score: "",
    maxScore: "",
  });
  const userID = session?.user?.id;

  // Object to hold form error messages
  const errors = {
    ASSIGNMENT_NAME: "Assignment Must Have a Name!",
    SEMESTER: "Grade Must Be For Semester!",
    CLASS: "Grade Must Be For Class!",
    SCORE: "Score Cannot Be Empty!",
    MAX_SCORE: "Max Score Cannot Be Empty!",
    CATEGORY: "Grade Must Be For Category!",
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSuccess(false);
      setError(null);
      setGrade({
        semesterID: null,
        classID: null,
        categoryID: null,
        assignmentName: "",
        score: "",
        maxScore: "",
      });
      setFormError(null);
    }
  }, [open]);

  // Update categoryID when prop changes
  useEffect(() => {
    setGrade((prev) => ({ ...prev, categoryID: catID || null }));
  }, [catID]);

  /**
   * handleFinish
   *
   * Validates each field and either sets formError or proceeds to save.
   */
  const handleFinish = () => {
    if (grade.semesterID === null && !fromGradePage) {
      setFormError(errors.SEMESTER);
      return;
    } else if (grade.classID === null && !fromGradePage) {
      setFormError(errors.CLASS);
      return;
    } else if (grade.categoryID === null) {
      setFormError(errors.CATEGORY);
      return;
    } else if (grade.assignmentName.length === 0) {
      setFormError(errors.ASSIGNMENT_NAME);
      return;
    } else if (grade.score.length === 0) {
      setFormError(errors.SCORE);
      return;
    } else if (grade.maxScore.length === 0) {
      setFormError(errors.MAX_SCORE);
      return;
    }

    setFormError(null);
    setError(null);
    handleSave();
  };

  /**
   * handleSave
   *
   * Posts the grade to the backend and updates success state.
   */
  const handleSave = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/grades`,
        grade,
      );
      console.log("Response:", response.data.grade);
      setSuccess(true);
    } catch (error) {
      console.error(
        "Error adding grade:",
        error.response?.data || error.message,
      );
      setSuccess(false);
      setError(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch semesters unless opened from grade page
  useEffect(() => {
    if (!userID) return;
    if (fromGradePage) {
      setLoading(false);
      return;
    }
    const fetchSemesters = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/semesters/${userID}`,
        );
        setSemesters(response.data);
      } catch (err) {
        setError(err.response?.data || "Error fetching semesters");
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, [userID, fromGradePage]);

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={() => handleClose(success)}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          minWidth: fromGradePage ? 400 : 500,
          minHeight: fromGradePage ? 200 : 400,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        {/* Modal Title */}
        <Typography level="h3" sx={{ fontWeight: "bold", mb: 1 }}>
          Add Grade
        </Typography>
        {/* Main content: loading, form, or result */}
        <Box sx={{ flexGrow: 1, paddingTop: 2, paddingLeft: 2 }}>
          {loading ? (
            <p>Loading...</p>
          ) : error || success ? (
            <GradeResult
              loading={submitting}
              success={success}
              error={error}
              fromGradePage={fromGradePage}
            />
          ) : (
            <GradeInformationForm
              fromGradePage={fromGradePage}
              semesters={semesters}
              grade={grade}
              setGrade={setGrade}
              formError={formError}
              errors={errors}
            />
          )}
        </Box>
        {/* Action buttons at bottom */}
        {!error && !success && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              mt: 2,
              pt: 2,
            }}
          >
            <Button color="inherit" onClick={() => handleClose(success)}>
              Cancel
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleFinish}>Finish</Button>
          </Box>
        )}
      </Sheet>
    </Modal>
  );
}

export default CreateGradeModal;
