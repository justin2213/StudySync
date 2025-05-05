import React, { useState } from "react";
import Typography from "@mui/joy/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import { Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import axios from "axios";
import dayjs from "dayjs"; // Import dayjs for date manipulation
import ConfirmationModal from "../ConfirmationModal.jsx";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

/**
 * UpcomingSection
 *
 * Renders a list of events for the upcoming week (next 7 days), grouped by day.
 * Allows selecting events via checkboxes, then marking them complete or deleting them.
 * Shows a confirmation modal before deletion.
 *
 * Props:
 * @param {Array<object>} events - Array of event objects with { id, title, type, classTitle?, start, end }
 * @param {(ids: Array<string> ) => void} markComplete - Callback to mark selected events complete
 * @param {(ids: Array<string> ) => void} deleteEvents - Callback to delete selected events
 *
 * @component
 * @returns {JSX.Element}
 */
function UpcomingSection({ events, markComplete, deleteEvents }) {
  // State for tracking checked event IDs
  const [checked, setChecked] = useState([]);
  // State for showing the delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handlers to open/close the confirmation modal
  const handleOpenDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  /**
   * capitalizeWord
   * Capitalizes the first letter of a string.
   */
  function capitalizeWord(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * handleToggle
   * Toggles selection of an event ID in the checked array.
   */
  const handleToggle = (id) => () => {
    const currentIndex = checked.indexOf(id);
    let newChecked = [];

    if (currentIndex === -1) {
      newChecked = [...checked, id];
    } else {
      newChecked = checked.filter((item) => item !== id);
    }

    setChecked(newChecked);
  };

  /**
   * handleMarkComplete
   * Calls markComplete with selected IDs and resets selection.
   */
  const handleMarkComplete = () => {
    markComplete(checked);
    setChecked([]);
  };

  /**
   * handleDelete
   * Calls deleteEvents with selected IDs, closes modal, resets selection.
   */
  const handleDelete = () => {
    deleteEvents(checked);
    setChecked([]);
    setShowDeleteModal(false);
  };

  // Generate next 7 days as dayjs objects
  const next7Days = Array.from({ length: 7 }, (_, i) => dayjs().add(i, "day"));

  // Group events by day, returning a JSX block per day if events exist
  const groupedEvents = next7Days.map((day) => {
    const eventsForDay = events.filter((event) => {
      if (!event.start) return false;
      return dayjs(event.start).isSame(day, "day");
    });
    if (eventsForDay.length === 0) return null;
    return (
      <Box key={day.format("YYYY-MM-DD")} my={2} mx={2}>
        <Typography level="h5" fontWeight="bold" gutterBottom>
          {day.format("dddd, MMMM D")}
        </Typography>
        <List>
          {eventsForDay.map((event) => {
            const labelId = `checkbox-list-label-${event.id}`;
            return (
              <ListItem key={event.id} disablePadding>
                <ListItemButton onClick={handleToggle(event.id)} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked.indexOf(event.id) !== -1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <Box
                    id={labelId}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      <Typography level="body-md">{event.title}</Typography>
                      <Typography level="body-md">
                        - {capitalizeWord(event.type)}
                      </Typography>
                      {event.classTitle && (
                        <Typography level="body-md">
                          - {capitalizeWord(event.classTitle)}
                        </Typography>
                      )}
                    </Stack>
                    <Typography level="body-md">
                      {event.start && event.end
                        ? `${dayjs.utc(event.start).local().format("hh:mm A")} - ${dayjs.utc(event.end).local().format("hh:mm A")}`
                        : "n/a"}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  });

  // Filter out days with no events
  const filteredGroupedEvents = groupedEvents.filter((g) => g !== null);

  return (
    <>
      {/* Confirmation modal for deletions */}
      {showDeleteModal && (
        <ConfirmationModal
          open={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          handleFinish={handleDelete}
          title="Delete Event"
          text={`Are you sure you want to delete ${checked.length} event${checked.length > 1 ? "s" : ""}? This action cannot be undone.`}
        />
      )}

      {/* Toolbar with title and action buttons */}
      <Toolbar disableGutters>
        <Typography level="h3" sx={{ fontWeight: "bold" }}>
          Upcoming Week
        </Typography>
        {checked.length > 0 && (
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}
          >
            <Typography color="inherit">{checked.length} selected</Typography>
            <Button variant="contained" onClick={handleMarkComplete}>
              Complete
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleOpenDeleteModal}
            >
              Delete
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Render grouped events or empty message */}
      {filteredGroupedEvents.length > 0 ? (
        filteredGroupedEvents
      ) : (
        <Typography
          level="body-lg"
          sx={{ textAlign: "center", py: 4, fontStyle: "italic" }}
        >
          Your upcoming week is clear!
        </Typography>
      )}
    </>
  );
}

export default UpcomingSection;
