import React, { useState } from "react";
import Sheet from "@mui/joy/Sheet";
import List from "@mui/material/List";
import { ListSubheader, Divider, Stack, Box } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import Typography from "@mui/joy/Typography";
import { useTheme } from "@mui/material/styles";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import Grid from "@mui/material/Grid2";
import advancedFormat from "dayjs/plugin/advancedFormat";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

dayjs.extend(advancedFormat); // gives you the `Do` token

/**
 * Renders a preview section that displays two separate lists of events: a two-week preview for regular events
 * and a deadlines list for events marked as deadlines.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.events - An array of event objects. Each event object may include:
 *   - id: {string|number} The unique identifier for the event.
 *   - title: {string} The title of the event.
 *   - start: {string|Date} The start date/time of the event.
 *   - end: {string|Date} The end date/time of the event.
 *   - description: {string} The description of the event.
 *   - semesterName: {string} The name of the semester associated with the event.
 *   - classTitle: {string} The title of the class associated with the event.
 *   - completed: {boolean} Indicates if the event is completed.
 *   - type: {string} The type of the event (e.g., "assignment", "class", "meeting", or "other").
 *   - isDeadline: {boolean} Indicates if the event is a deadline.
 *
 * @returns {JSX.Element} A JSX element that includes two lists:
 *   - A "2 Week Preview" list for regular events.
 *   - A "Deadlines" list for events designated as deadlines.
 */
export default function PreviewSection({ events }) {
  const theme = useTheme();

  const regularEvents = events.filter((event) => !event.isDeadline);
  const deadlines = events.filter((event) => event.isDeadline);

  // Separate expansion state for each List
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [deadlinesExpanded, setDeadlinesExpanded] = useState(false);

  const handlePreviewChange = (id) => (e, isExpanded) => {
    setPreviewExpanded(isExpanded ? id : false);
  };
  const handleDeadlinesChange = (id) => (e, isExpanded) => {
    setDeadlinesExpanded(isExpanded ? id : false);
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getColorForType = (str) => {
    switch (str) {
      case "assignment":
        return theme.palette.success.main;
      case "class":
        return theme.palette.primary.main;
      case "meeting":
        return theme.palette.warning.main;
      case "other":
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Sheet
      variant="outlined"
      elevation={3}
      sx={{ borderRadius: "md", overflow: "hidden" }}
    >
      {/* ───────────────────────────────────────────────── 2 Week Preview */}
      <List
        component="ul"
        sx={{ p: 0, m: 0, maxHeight: 300, overflowY: "auto" }}
      >
        <ListSubheader
          component="li"
          sx={{
            position: "sticky",
            top: 0,
            p: 0, // we’ll put padding on the link itself
            bgcolor: "#4652b7",
            borderBottom: 1,
            borderColor: "divider",

            /* style any <a> inside this sub‑header */
            "& a": {
              display: "block", // fill the full width
              color: "inherit",
              textDecoration: "none",
              py: 1,
              px: 2,
              transition: "background-color .2s ease",

              "&:hover": {
                bgcolor: "#5462de", // or any colour from the theme
                cursor: "pointer",
              },
            },
          }}
        >
          <Link
            to="/work"
            style={{
              textDecoration: "none",
              color: "white",
              display: "block",
            }}
          >
            <Typography
              level="h3"
              sx={{ m: 0, color: "white", textAlign: "left" }}
            >
              2 Week Preview
            </Typography>
          </Link>
        </ListSubheader>
        <Divider component="li" />

        {regularEvents.length > 0 ? (
          regularEvents.map((event) => (
            <Accordion
              key={event.id}
              component="li"
              disableGutters
              square
              expanded={previewExpanded === event.id}
              onChange={handlePreviewChange(event.id)}
              sx={{
                border: 0,
                "&:before": { display: "none" },
                "&:not(:first-of-type)": {
                  borderTop: `1px solid ${theme.palette.divider}`,
                },
                "&:last-of-type": {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                "&.Mui-expanded": { margin: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowForwardIosSharpIcon />}
                aria-controls={`${event.id}-content`}
                id={`${event.id}-header`}
                sx={{
                  borderBottom: 0,
                  minHeight: 48,
                  "&.Mui-expanded": { minHeight: 48 },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {event.completed ? (
                    <CheckCircleIcon
                      fontSize="small"
                      sx={{ color: getColorForType(event.type) }}
                    />
                  ) : (
                    <CircleIcon
                      fontSize="small"
                      sx={{ color: getColorForType(event.type) }}
                    />
                  )}
                  <Typography>
                    {event.title}
                    {" – "}
                    {dayjs(event.start ?? event.end).format("MMM Do")}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container rowGap={2}>
                  <Grid container size={12}>
                    <Grid size={4}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Start:</strong>{" "}
                        {event.start
                          ? dayjs(event.start).format("hh:mm A")
                          : "—"}
                      </Typography>
                    </Grid>
                    <Grid size={4}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>End:</strong>{" "}
                        {event.end ? dayjs(event.end).format("hh:mm A") : "—"}
                      </Typography>
                    </Grid>
                    <Grid size={4}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Type:</strong> {capitalizeFirst(event.type)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container size={12}>
                    <Grid size={6}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Semester:</strong>{" "}
                        {event.semesterName ?? "None"}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Class:</strong> {event.classTitle ?? "None"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid size={12}>
                    <Typography level="body-xs" sx={{ m: 0 }}>
                      <strong>Completed:</strong>{" "}
                      {event.completed ? "Yes" : "No"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      level="body-xs"
                      component="div"
                      sx={{
                        m: 0,
                        maxWidth: "100%",
                        textWrap: "wrap",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      <strong>Description:</strong>{" "}
                      {event.description.length > 0
                        ? event.description
                        : "None"}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Box
            component="li"
            sx={{
              py: 2, // vertical padding
              px: 2,
              height: 250,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center", // centre the line
            }}
          >
            <Typography
              level="title-lg"
              sx={{ fontStyle: "italic", color: "text.secondary" }}
            >
              Your 2 weeks are clear!
            </Typography>
          </Box>
        )}
      </List>

      {/* ───────────────────────────────────────────────── Deadlines */}
      <List
        component="ul"
        sx={{ p: 0, m: 0, maxHeight: 300, overflowY: "auto" }}
      >
        <ListSubheader
          component="li"
          sx={{
            position: "sticky",
            top: 0,
            p: 0, // we’ll put padding on the link itself
            bgcolor: "#4652b7",
            borderBottom: 1,
            borderColor: "divider",

            /* style any <a> inside this sub‑header */
            "& a": {
              display: "block", // fill the full width
              color: "inherit",
              textDecoration: "none",
              py: 1,
              px: 2,
              transition: "background-color .2s ease",

              "&:hover": {
                bgcolor: "#5462de", // or any colour from the theme
                cursor: "pointer",
              },
            },
          }}
        >
          <Link
            to="/work"
            style={{
              textDecoration: "none",
              color: "white",
              display: "block",
            }}
          >
            <Typography
              level="h3"
              sx={{ m: 0, color: "inherit", textAlign: "left" }}
            >
              Deadlines
            </Typography>
          </Link>
        </ListSubheader>
        <Divider component="li" />
        {deadlines.length > 0 ? (
          deadlines.map((event) => (
            <Accordion
              key={event.id}
              component="li"
              disableGutters
              square
              expanded={deadlinesExpanded === event.id}
              onChange={handleDeadlinesChange(event.id)}
              sx={{
                border: 0,
                "&:before": { display: "none" },
                "&:not(:first-of-type)": {
                  borderTop: `1px solid ${theme.palette.divider}`,
                },
                "&.Mui-expanded": { margin: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowForwardIosSharpIcon />}
                aria-controls={`${event.id}-content`}
                id={`${event.id}-header`}
                sx={{
                  borderBottom: 0,
                  minHeight: 48,
                  "&.Mui-expanded": { minHeight: 48 },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <ErrorIcon
                    fontSize="small"
                    sx={{ color: getColorForType(event.type) }}
                  />
                  <Typography>
                    {event.title}
                    {" – "}
                    {dayjs(event.start ?? event.end).format("MMM Do")}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container rowGap={2}>
                  <Grid container size={12}>
                    <Grid size={6}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Due:</strong>{" "}
                        {event.end ? dayjs(event.end).format("hh:mm A") : "—"}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Type:</strong> {capitalizeFirst(event.type)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container size={12}>
                    <Grid size={6}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Class:</strong> {event.classTitle ?? "None"}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography level="body-xs" sx={{ m: 0 }}>
                        <strong>Semester:</strong>{" "}
                        {event.semesterName ?? "None"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid size={12}>
                    <Typography
                      level="body-xs"
                      component="div"
                      sx={{
                        m: 0,
                        maxWidth: "100%",
                        textWrap: "wrap",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      <strong>Description:</strong>{" "}
                      {event.description.length > 0
                        ? event.description
                        : "None"}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Box
            component="li"
            sx={{
              py: 2, // vertical padding
              px: 2,
              height: 250,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center", // centre the line
            }}
          >
            <Typography
              level="title-lg"
              sx={{ fontStyle: "italic", color: "text.secondary" }}
            >
              No deadlines in next two weeks!
            </Typography>
          </Box>
        )}
      </List>
    </Sheet>
  );
}
