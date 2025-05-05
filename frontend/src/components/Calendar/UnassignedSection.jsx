import Chip from "@mui/material/Chip";
import { Stack } from "@mui/material";
import Typography from "@mui/joy/Typography";
import { useTheme } from "@mui/material/styles";

/**
 * UnassignedSection
 *
 * Displays a vertical list of "unassigned" events that can be dragged into the calendar.
 * Each event is shown as a colored Chip reflecting its type (assignment, class, meeting, other).
 * Uses a Stack with scroll overflow and integrates with FullCalendar's Draggable via data-event.
 *
 * Props:
 * @param {React.RefObject<HTMLElement>} unassignedRef - Ref to the container for initializing drag behavior
 * @param {Array<object>} unassignedEvents           - Array of event objects without start/end dates
 *        Each event object should include:
 *          - id: string or number
 *          - title: string
 *          - type: one of "assignment" | "class" | "meeting" | "other"
 *          - any additional extendedProps as needed when dropped into FullCalendar
 *
 * @component
 * @returns {JSX.Element} The unassigned events list
 */
function UnassignedSection({ unassignedRef, unassignedEvents }) {
  const theme = useTheme();

  /**
   * getBackgroundColor
   *
   * Returns a theme-based background color for a given event type.
   * @param {string} eventType - The type of the event
   * @returns {string} CSS color string from the MUI theme palette
   */
  const getBackgroundColor = (eventType) => {
    switch (eventType) {
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
    <>
      {/* Section heading */}
      <Typography level="h3" sx={{ fontWeight: "bold" }}>
        Unassigned
      </Typography>

      {/* Container for draggable event chips */}
      <Stack
        ref={unassignedRef}
        direction="column"
        spacing={1}
        marginTop={2}
        maxHeight={550}
        overflow="scroll"
      >
        {unassignedEvents.map((event) => (
          <Chip
            key={event.id}
            label={event.title}
            className="fc-external-event"
            data-event={JSON.stringify(event)}
            sx={{
              cursor: "grab",
              height: "auto",
              backgroundColor: getBackgroundColor(event.type),
              color: "white",
              "& .MuiChip-label": {
                display: "block",
                fontWeight: "bold",
                py: 1,
                whiteSpace: "normal",
              },
            }}
          />
        ))}
      </Stack>
    </>
  );
}

export default UnassignedSection;
