import Button from "@mui/material/Button";
import Typography from "@mui/joy/Typography";
import Radio from "@mui/material/Radio";
import Grid from "@mui/material/Grid2";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * CalendarToolbar
 *
 * Renders a toolbar for navigating and switching views in the FullCalendar component.
 * - Displays the current calendar title.
 * - Provides radio buttons to switch between Month/Week/Day views.
 * - Includes controls to go to previous, next, or today.
 *
 * Props:
 * @param {object} props
 * @param {object|null} props.calendarApi - FullCalendar API instance for navigation
 * @param {string} props.currentTitle      - Title of the current calendar view (e.g. "April 2025")
 * @param {string} props.view              - Current view identifier ("dayGridMonth" | "timeGridWeek" | "timeGridDay")
 * @param {(view: string) => void} props.onViewChange - Callback when the view selection changes
 *
 * @component
 * @returns {JSX.Element} The toolbar UI
 */
function CalendarToolbar({ calendarApi, currentTitle, view, onViewChange }) {
  return (
    <Grid container sx={{ paddingX: 2, paddingBottom: 1 }}>
      {/* Left: Current view title */}
      <Grid
        size={4}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Typography level="h3">{currentTitle}</Typography>
      </Grid>

      {/* Center: View selection radio buttons */}
      <Grid
        size={4}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <RadioGroup
          row
          value={view}
          onChange={(e) => onViewChange(e.target.value)}
          aria-label="calendar view"
          name="calendar-view"
        >
          <FormControlLabel
            value="dayGridMonth"
            control={<Radio />}
            label="Month"
          />
          <FormControlLabel
            value="timeGridWeek"
            control={<Radio />}
            label="Week"
          />
          <FormControlLabel
            value="timeGridDay"
            control={<Radio />}
            label="Day"
          />
        </RadioGroup>
      </Grid>

      {/* Right: Navigation controls */}
      <Grid
        size={4}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Go to previous period */}
        <IconButton aria-label="prev">
          <ChevronLeftIcon onClick={() => calendarApi && calendarApi.prev()} />
        </IconButton>

        {/* Go to today's date */}
        <Button
          variant="contained"
          onClick={() => calendarApi && calendarApi.today()}
        >
          Today
        </Button>

        {/* Go to next period */}
        <IconButton aria-label="next">
          <ChevronRightIcon onClick={() => calendarApi && calendarApi.next()} />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default CalendarToolbar;
