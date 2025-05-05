import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ClassInformationForm from "./ClassInformationForm.jsx";
import GradeDistributionForm from "./GradeDistributionForm.jsx";
import ReviewClassInfo from "./ReviewClassInfo.jsx";
import { useState } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import ClassResult from "./ClassResult.jsx";
import axios from "axios";
import { useSession } from "@supabase/auth-helpers-react";

/**
 * CreateClassModal
 *
 * A multi-step modal dialog for creating a class:
 * 1. Class Information entry
 * 2. Grade Distribution setup
 * 3. Review details
 * 4. Submission result (loading, success, or error)
 *
 * Props:
 * @param {() => void} handleClose - Callback to close the modal
 * @param {boolean} open - Controls modal visibility
 * @param {boolean} [semesterDisabled=false] - If true, semester selection is fixed
 * @param {string|object} [classSemester=""] - Pre-selected semester value
 * @param {(classInfo: object) => void} finish - Callback after successful creation
 *
 * @component
 * @returns {JSX.Element} The create-class modal UI
 */
function CreateClassModal({
  handleClose,
  open,
  semesterDisabled = false,
  classSemester = "",
  finish,
}) {
  // State hooks for submission status and step tracking
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const session = useSession();

  // Object to hold error messages
  const errors = {
    CLASS_NAME: "Class Must Have a Name!",
    CLASS_START: "Class Must Have A Start Time!",
    CLASS_DAYS: "Must Take Place At Least One Day!",
    CLASS_END_1: "Must End After Start!",
    CLASS_END: "Class Must Have An End Time!",
    CLASS_SEMESTER: "Class Must Have A Semester!",
    CLASS_DISTRIBUTION_CATEGORY: "All Categories Must Have Names!",
    CLASS_DISTRIBUTION_WEIGHT: "Weights Must Add Up to 100%!",
    CLASS_DISTRIBUTION_WEIGHT_1: "Weight Cannot Be 0%!",
  };

  // Form state containing all class details
  const [classInfo, setClassInfo] = useState({
    className: "",
    classSemester: classSemester || "",
    classStart: null,
    classEnd: null,
    classDays: [],
    gradeDistribution: [
      { category: "", weight: "" },
      { category: "", weight: "" },
      { category: "", weight: "" },
      { category: "", weight: "" },
    ],
  });
  const [formError, setFormError] = useState(null);

  // Labels for each step
  const steps = ["Class Information", "Grade Distribution", "Review"];

  /**
   * handleCreateClass
   *
   * Sends classInfo to the backend and updates loading/success state.
   */
  const handleCreateClass = async () => {
    try {
      setIsLoading(true);
      const classData = { ...classInfo, userID: session.user.id || "" };
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/classes`,
        classData,
      );
      console.log("Response:", response.data);
      setSuccess(true);
    } catch (error) {
      console.error(
        "Error creating class:",
        error.response?.data || error.message,
      );
      setError(error);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleFinish
   *
   * Invokes external finish callback and closes modal.
   */
  const handleFinish = (classInfo) => {
    finish(classInfo);
    handleClose();
  };

  /**
   * handleNext
   *
   * Validates current step, advances to next, or submits on final step.
   */
  const handleNext = () => {
    // Step 0: Validate class information
    if (activeStep === 0) {
      if (classInfo.className.length === 0) {
        setFormError(errors.CLASS_NAME);
        return;
      } else if (classInfo.classSemester.length === 0) {
        setFormError(errors.CLASS_SEMESTER);
        return;
      } else if (!classInfo.classStart || !classInfo.classStart.isValid()) {
        setFormError(errors.CLASS_START);
        return;
      } else if (!classInfo.classEnd || !classInfo.classEnd.isValid()) {
        setFormError(errors.CLASS_END);
        return;
      } else if (classInfo.classEnd.isBefore(classInfo.classStart)) {
        setFormError(errors.CLASS_END_1);
        return;
      } else if (classInfo.classDays.length === 0) {
        setFormError(errors.CLASS_DAYS);
        return;
      }
    }

    // Step 1: Validate grade distribution
    if (activeStep === 1) {
      const filtered = classInfo.gradeDistribution.filter(
        (grade) => !(grade.category === "" && grade.weight === ""),
      );
      const copy = filtered.map((grade) => ({
        ...grade,
        weight: grade.weight === "" ? 0 : Number(grade.weight),
      }));
      let total = 0;
      let newError = null;
      for (let i = 0; i < copy.length; i++) {
        const grade = copy[i];
        if (grade.category === "" && grade.weight !== 0) {
          newError = errors.CLASS_DISTRIBUTION_CATEGORY;
          break;
        }
        if (grade.weight === 0) {
          newError = errors.CLASS_DISTRIBUTION_WEIGHT_1;
          break;
        }
        total += grade.weight;
      }
      if (!newError && total !== 100) {
        newError = errors.CLASS_DISTRIBUTION_WEIGHT;
      }
      if (newError) {
        setFormError(newError);
        return;
      }
      setClassInfo((prev) => ({ ...prev, gradeDistribution: filtered }));
    }

    // Step 2: Submit or finish
    if (activeStep === 2) {
      if (semesterDisabled) {
        handleFinish(classInfo);
      } else {
        setActiveStep((prev) => prev + 1);
        handleCreateClass();
      }
    }

    setFormError(null);
    setActiveStep((prev) => prev + 1);
  };

  /**
   * handleBack
   *
   * Steps backward in the stepper.
   */
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  /**
   * getStepContent
   *
   * Renders the component for the given step index.
   */
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ClassInformationForm
            classInfo={classInfo}
            setClassInfo={setClassInfo}
            semesterDisabled={semesterDisabled}
            formError={formError}
            errors={errors}
          />
        );
      case 1:
        return (
          <GradeDistributionForm
            classInfo={classInfo}
            setClassInfo={setClassInfo}
            formError={formError}
            errors={errors}
          />
        );
      case 2:
        return (
          <ReviewClassInfo
            classInfo={classInfo}
            semesterDisabled={semesterDisabled}
          />
        );
      default:
        return <ClassResult isLoading={isLoading} success={success} />;
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
          Create Class
        </Typography>
        {/* Stepper Navigation */}
        <Box sx={{ width: "100%", p: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
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
            ))}
          </Stepper>
        </Box>
        {/* Current Step Content */}
        <Box sx={{ flexGrow: 1, paddingTop: 2, paddingLeft: 2 }}>
          {getStepContent(activeStep)}
        </Box>
        {/* Navigation Buttons */}
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
          </Box>
        )}
      </Sheet>
    </Modal>
  );
}

export default CreateClassModal;
