import React, { useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

/**
 * stringToColor
 *
 * Generates a consistent hex color code based on a given string.
 * Useful for creating visually distinct backgrounds per class name.
 *
 * @param {string} string - The input text to hash
 * @returns {string} A hex color code like "#3e92cc"
 */
function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

/**
 * imageSetup
 *
 * Derives an index (1–8) from a color string for selecting a background image.
 * Ensures the result stays within valid bounds.
 *
 * @param {string} string - A hex color (e.g. "#3e92cc")
 * @returns {number} A number from 1 to 8
 */
function imageSetup(string) {
  let temp = "0x" + string.substring(1);
  temp = Number(temp) >> 19;
  temp = parseInt(temp / 3);
  if (temp >= 8) temp = 8;
  else if (temp < 1) temp = 1;
  return temp;
}

/**
 * StyledCard
 *
 * A customized MUI Card with hover scaling and shadow.
 */
const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  minWidth: 200,
  maxWidth: 200,
  height: "100%",
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[3],
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: theme.shadows[6],
  },
}));

/**
 * ClassCard
 *
 * Displays a card for a class with:
 * - A colored header based on class name
 * - Start/end times and days
 * - A menu to delete the class
 *
 * Props:
 * @param {Object} props
 * @param {Object} props.classInfo - Details about the class
 * @param {string} props.classInfo.classID - Unique class identifier
 * @param {string} props.classInfo.className - Name of the class
 * @param {dayjs.Dayjs} props.classInfo.classStart - Class start time
 * @param {dayjs.Dayjs} props.classInfo.classEnd - Class end time
 * @param {string[]} props.classInfo.classDays - Days of the week
 * @param {(id: string) => void} props.deleteClass - Callback to delete this class
 * @returns {JSX.Element}
 */
export default function ClassCard({ classInfo, deleteClass }) {
  // Anchor element for the options menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Derive background color and image index from class name
  const backgroundColor = stringToColor(classInfo.className);
  const num = imageSetup(backgroundColor);

  // Open the menu without letting the card click propagate
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // Close the options menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Format days list for display
  const classDays = classInfo.classDays.join(", ");

  return (
    <StyledCard>
      {/* Options menu trigger */}
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        aria-label="options"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      {/* Delete action menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            deleteClass(classInfo.classID);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Main clickable area navigates to class detail */}
      <CardActionArea
        component={Link}
        to={`/classes/${classInfo.classID}`}
        sx={{
          height: "100%",
          "&:hover .MuiCardActionArea-focusHighlight": {
            opacity: 0.08,
            backgroundColor: "transparent",
          },
        }}
      >
        {/* Colored header image */}
        <CardMedia sx={{ height: 140, backgroundColor }}>
          <img
            src={require(`../cardBackgrounds/background${num}.svg`)}
            height="140"
            width="200"
            style={{ opacity: 0.5 - num / 50 }}
          />
        </CardMedia>

        {/* Class details */}
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {classInfo.className}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {classInfo.classStart.format("h:mm A")} –{" "}
            {classInfo.classEnd.format("h:mm A")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {classDays}
          </Typography>
        </CardContent>
      </CardActionArea>
    </StyledCard>
  );
}
