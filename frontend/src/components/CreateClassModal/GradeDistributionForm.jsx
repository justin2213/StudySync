import React, { useState } from "react";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import GradeIcon from "@mui/icons-material/Grade";

/**
 * GradeDistributionForm
 *
 * Allows users to define and adjust weight distributions for grade categories within a class.
 * - Displays existing categories with inputs for name and weight.
 * - Provides an "Add Category" button to append new entries.
 * - Each entry has a delete button to remove that category.
 * - Placeholder texts guide common category names and weight values.
 * - Validation errors are shown based on external formError and errors props.
 *
 * Props:
 * @param {object} classInfo                  - Current class state containing gradeDistribution array.
 * @param {function} setClassInfo             - Setter function to update classInfo state.
 * @param {string|null} formError             - Validation error message key for distribution fields.
 * @param {object} errors                     - Mapping of error keys to display messages.
 *
 * @component
 * @returns {JSX.Element} The grade distribution form UI.
 */
export default function GradeDistributionForm({
  classInfo,
  setClassInfo,
  formError,
  errors,
}) {
  // Append a new blank category entry to the distribution
  const handleAdd = () => {
    setClassInfo((prevState) => ({
      ...prevState,
      gradeDistribution: [
        ...prevState.gradeDistribution,
        { category: "", weight: "" },
      ],
    }));
  };

  // Create a change handler for the category input at `index`
  const handleCategoryChange = (index) => (e) => {
    const value = e.target.value;
    setClassInfo((prevState) => {
      const newDistribution = [...prevState.gradeDistribution];
      newDistribution[index] = {
        ...newDistribution[index],
        category: value,
      };
      return {
        ...prevState,
        gradeDistribution: newDistribution,
      };
    });
  };

  // Create a change handler for the weight input at `index`
  const handleWeightChange = (index) => (e) => {
    const value = e.target.value;
    setClassInfo((prevState) => {
      const newDistribution = [...prevState.gradeDistribution];
      newDistribution[index] = {
        ...newDistribution[index],
        weight: value,
      };
      return {
        ...prevState,
        gradeDistribution: newDistribution,
      };
    });
  };

  // Remove the distribution entry at `index`
  const handleDelete = (index) => {
    setClassInfo((prevState) => ({
      ...prevState,
      gradeDistribution: prevState.gradeDistribution.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  // Placeholder values for the first few categories and weights
  const categoryPlaceholders = [
    "e.g., Homework",
    "e.g., Exams",
    "e.g., Projects",
    "e.g., Attendance",
  ];
  const weightPlaceholders = ["20", "50", "20", "10"];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography level="title-lg" sx={{ fontWeight: "bold", mb: 1 }}>
        Grade Distribution
      </Typography>
      <Grid container spacing={4} marginTop={3}>
        <Grid
          item
          size={5}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Stack spacing={1} sx={{ mt: -1 }}>
            <GradeIcon sx={{ fontSize: 180 }} />
            <Fab variant="extended" color="primary" onClick={handleAdd}>
              <SpeedDialIcon sx={{ mr: 1 }} />
              Add Category
            </Fab>
          </Stack>
        </Grid>
        <Grid item size={6}>
          {/* Header row for labels */}
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Category
            </Typography>
            <Typography variant="subtitle1" sx={{ flex: 1, paddingLeft: 2 }}>
              Weight
            </Typography>
          </Stack>
          {/* Scrollable list of distribution entries */}
          <Stack
            direction="column"
            spacing={2}
            sx={{ maxHeight: 220, overflow: "scroll" }}
          >
            {classInfo.gradeDistribution.map((grade, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                {/* Category input field */}
                <OutlinedInput
                  size="small"
                  value={grade.category}
                  placeholder={index < 4 ? categoryPlaceholders[index] : ""}
                  onChange={handleCategoryChange(index)}
                />
                {/* Weight input with percent adornment */}
                <OutlinedInput
                  size="small"
                  type="number"
                  value={grade.weight}
                  placeholder={index < 4 ? weightPlaceholders[index] : ""}
                  onChange={handleWeightChange(index)}
                  endAdornment={
                    <InputAdornment position="end">%</InputAdornment>
                  }
                  sx={{ maxWidth: 125, flex: 1 }}
                />
                {/* Delete icon button */}
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDelete(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
          {/* Validation error messages */}
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <Typography level="body-xs" sx={{ flex: 1, color: "red" }}>
              {formError === errors.CLASS_DISTRIBUTION_CATEGORY
                ? formError
                : ""}
            </Typography>
            <Typography
              level="body-xs"
              sx={{ flex: 1, paddingLeft: 2, color: "red" }}
            >
              {formError === errors.CLASS_DISTRIBUTION_WEIGHT ||
              formError === errors.CLASS_DISTRIBUTION_WEIGHT_1
                ? formError
                : ""}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
