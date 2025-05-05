import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import ReviewSemesterInfo from "./ReviewSemesterInfo.jsx";
import AddClassesForm from "./AddClassesForm.jsx";
import SemesterInformationForm from "./SemesterInformationForm.jsx";
import SemesterResult from "./SemesterResult.jsx";
import { useState } from "react";
import axios from "axios";
import { useSession } from "@supabase/auth-helpers-react";

const errors = {
  SEMESTER_NAME: "Semester Must Have a Name!",
  SEMESTER_END: "Must End After Start!",
};

const steps = ["Semester Information", "Add Classes", "Review"];

/**
 * CreateSemesterModal
 *
 * A multi-step modal dialog for creating a new academic semester:
 * 1. Enter semester details (name, start/end dates)
 * 2. Optionally add classes to the semester
 * 3. Review all entered information
 * 4. Submit to backend and display result
 *
 * Props:
 * @param {() => void} handleClose - Callback invoked to close the modal
 * @param {boolean} open - Controls the visibility of the modal
 *
 * @component
 * @returns {JSX.Element} The create-semester modal UI
 */
function CreateSemesterModal({ handleClose, open }) {
  // Track current step index
  const [activeStep, setActiveStep] = useState(0);
  // Track which steps were skipped
  const [skipped, setSkipped] = useState(new Set());
  // Submission success flag
  const [success, setSuccess] = useState(null);
  // Loading indicator for submission
  const [isLoading, setIsLoading] = useState(false);
  // Supabase session to obtain userID
  const session = useSession();
  // Local state for semester form data
  const [semester, setSemester] = useState({
    semesterName: "",
    semesterStart: dayjs(),
    semesterEnd: dayjs(),
    classes: [],
  });
  // Validation error key
  const [formError, setFormError] = useState(null);

  /**
   * handleCreateSemester
   *
   * Sends the semester data to the backend and updates success state.
   */
  const handleCreateSemester = async () => {
    try {
      setIsLoading(true);
      const semesterData = { ...semester, userID: session.user.id || "" };
      console.log("Sending Data:", semesterData);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/semesters`,
        semesterData,
      );
      console.log("Response:", response.data);
      setSuccess(true);
    } catch (error) {
      console.error(
        "Error creating semester:",
        error.response?.data || error.message,
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * isStepOptional
   *
   * Determines if a given step index is optional (skippable).
   */
  const isStepOptional = (step) => step === 1;

  /**
   * isStepSkipped
   *
   * Checks if a given step index was skipped by the user.
   */
  const isStepSkipped = (step) => skipped.has(step);

  /**
   * handleNext
   *
   * Validates current step inputs, advances to the next step,
   * or triggers submission on final step.
   */
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate semester details
      if (semester.semesterName.length === 0) {
        setFormError(errors.SEMESTER_NAME);
        return;
      } else if (semester.semesterEnd.isBefore(semester.semesterStart)) {
        setFormError(errors.SEMESTER_END);
        return;
      }
    }
    if (activeStep === 1) {
      // If no classes added, skip this optional step
      if (semester.classes.length === 0) {
        handleSkip();
        return;
      } else {
        // If previously skipped, remove from skipped set
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
          newSkipped = new Set(newSkipped.values());
          newSkipped.delete(activeStep);
        }
        setSkipped(newSkipped);
      }
    }
    if (activeStep === 2) {
      // On review step, submit and then advance
      setActiveStep((prev) => prev + 1);
      handleCreateSemester();
    }
    // Clear any existing error and advance step
    setFormError(null);
    setActiveStep((prev) => prev + 1);
  };

  /**
   * handleBack
   *
   * Moves the stepper back by one step.
   */
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  /**
   * handleSkip
   *
   * Skips the optional step by advancing and marking it skipped.
   */
  const handleSkip = () => {
    setActiveStep((prev) => prev + 1);
    setSkipped((prev) => {
      const newSkipped = new Set(prev.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  /**
   * getStepContent
   *
   * Renders the component for the current step index.
   */
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <SemesterInformationForm
            semester={semester}
            setSemester={setSemester}
            formError={formError}
            errors={errors}
          />
        );
      case 1:
        return <AddClassesForm semester={semester} setSemester={setSemester} />;
      case 2:
        return <ReviewSemesterInfo semester={semester} />;
      default:
        return <SemesterResult isLoading={isLoading} success={success} />;
    }
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={handleClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          minWidth: 900,
          minHeight: 575,
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
          Create Semester
        </Typography>

        {/* Stepper Navigation */}
        <Box sx={{ width: "100%", p: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};
              if (isStepOptional(index)) {
                labelProps.optional = (
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    (Optional)
                  </Typography>
                );
              }
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel
                    {...labelProps}
                    sx={{
                      "& .MuiStepIcon-root.Mui-completed": {
                        color:
                          success === true
                            ? "success.main"
                            : success === false
                              ? "error.main"
                              : "primary.main",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        {/* Dynamic content area for each step */}
        <Box sx={{ flexGrow: 1 }}>{getStepContent(activeStep)}</Box>

        {/* Navigation Buttons Always at Bottom */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            mt: 2,
            pt: 2,
          }}
        >
          {activeStep >= steps.length ? (
            <></>
          ) : (
            <>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleNext}>
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </>
          )}
        </Box>
      </Sheet>
    </Modal>
  );
}

export default CreateSemesterModal;
