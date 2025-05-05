import React, { useRef, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import GradeSection from "../components/Dashboard/GradeSection.jsx";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import dayjs from "dayjs";
import PreviewSection from "../components/Dashboard/PreviewSection.jsx";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSession } from "@supabase/auth-helpers-react";
import LoadingIndicator from "../components/Loading.jsx";

/**
 * Dashboard
 *
 * Fetches and displays the current user's tasks/events and grades.
 * Renders:
 *  - A FullCalendar view of today’s events with custom styling and interactions.
 *  - A grade summary section.
 *  - A preview list of upcoming non-class events.
 *
 * @component
 * @returns {JSX.Element} The dashboard UI
 */
export default function Dashboard() {
  // References to calendar container and unassigned tasks area (unused placeholder)
  const calendarRef = useRef(null);
  const unassignedRef = useRef(null);

  // MUI theme and responsive queries
  const theme = useTheme();

  // Local loading and error states for data fetching
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetched data state: events for the calendar and grade objects
  const [events, setEvents] = useState([]);
  const [grades, setGrades] = useState([]);

  // Navigation hook for routing to full calendar view
  const navigate = useNavigate();

  // Supabase session to get current user ID
  const { user } = useSession();
  const userID = user?.id;

  /**
   * Fetch dashboard events and grades when the user ID becomes available.
   * - GET /tasks/dashboard/:userID → populates `events`
   * - GET /grades/:userID → populates `grades`
   * Handles loading and error states.
   */
  useEffect(() => {
    if (!userID) return;

    const fetchEvents = async () => {
      try {
        const eventData = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/tasks/dashboard/${userID}`,
        );
        setEvents(eventData.data.events);

        const gradeData = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/grades/${userID}`,
        );
        setGrades(gradeData.data);
      } catch (err) {
        setError(err.response?.data || "Error fetching events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userID]);

  /**
   * Memoized list of today’s calendar events.
   * - Filters `events` to those whose start or end date matches today.
   * - Formats deadline events onto the all-day slot with time in title.
   */
  const calendarEvents = useMemo(() => {
    const today = dayjs();
    return events
      .filter((evt) => {
        const dateToCheck = evt.isDeadline ? evt.end : evt.start;
        return dateToCheck && dayjs(dateToCheck).isSame(today, "day");
      })
      .map((evt) => {
        if (evt.isDeadline) {
          const formatted = dayjs(evt.end).format("hh:mm A");
          return {
            ...evt,
            allDay: true,
            start: evt.end,
            title: `${formatted} – ${evt.title}`,
          };
        }
        return evt;
      });
  }, [events]);

  /**
   * Memoized list of future preview events (excluding classes).
   * - Filters `events` to those with a start or end after now and type !== "class".
   */
  const previewEvents = useMemo(() => {
    const now = dayjs();
    return events.filter((e) => {
      const ts = e.start ?? e.end;
      return e.type !== "class" && ts && dayjs(ts).isAfter(now);
    });
  }, [events]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Loading overlay shown while fetching data */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingIndicator />
        </Box>
      )}

      {/* Page header */}
      <Typography level="h1" component="h1" sx={{ fontWeight: "bold", p: 2 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2} marginX={2} alignItems="flex-start">
        {/* Left column: calendar and grades */}
        <Grid container gap={2} size={8}>
          <Grid size={12}>
            {/* Calendar box: navigates to full calendar on click */}
            <Box
              marginBottom={1}
              className="dashboard-calendar"
              onClick={() => navigate("/calendar")}
              sx={{ cursor: "pointer" }}
            >
              <FullCalendar
                timeZone="local"
                ref={calendarRef}
                height="400px"
                headerToolbar={false}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                dayMaxEvents={2}
                eventOverlap={(stillEvent, movingEvent) => {
                  if (stillEvent.extendedProps.isDeadline) {
                    return true;
                  }
                  return stillEvent.extendedProps.completed === true;
                }}
                eventOrder={(a, b) => {
                  if (a.extendedProps.completed === b.extendedProps.completed) {
                    return a.start - b.start;
                  }
                  return a.extendedProps.completed ? 1 : -1;
                }}
                droppable={false}
                editable={false}
                allDayText="Deadlines"
                views={{
                  timeGridDay: { allDaySlot: true },
                  timeGridWeek: { allDaySlot: true },
                  dayGridMonth: {
                    editable: false,
                    eventStartEditable: false,
                    eventDurationEditable: false,
                  },
                }}
                events={calendarEvents}
                eventDidMount={(info) => {
                  // Attach data attribute and apply custom styling per event properties
                  info.el.dataset.eventId = info.event.id;
                  let backgroundColor;
                  if (info.event.extendedProps.isDeadline) {
                    backgroundColor = theme.palette.error.main;
                  } else {
                    switch (info.event.extendedProps.type) {
                      case "assignment":
                        backgroundColor = theme.palette.success.main;
                        break;
                      case "class":
                        backgroundColor = theme.palette.primary.main;
                        break;
                      case "meeting":
                        backgroundColor = theme.palette.warning.main;
                        break;
                      default:
                        backgroundColor = theme.palette.grey[500];
                    }
                  }
                  Object.assign(info.el.style, {
                    backgroundColor,
                    color: "white",
                    cursor: "pointer",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    padding: "2px 2px",
                    fontSize: "12px",
                    borderColor: backgroundColor,
                    borderStyle: "solid",
                    borderWidth: "1px",
                    textDecoration: info.event.extendedProps.completed
                      ? "line-through"
                      : "none",
                  });

                  // Month-view hover clone
                  if (info.view.type === "dayGridMonth") {
                    info.el._hoverClone = null;
                    info.el.addEventListener("mouseenter", () => {
                      if (!info.el._hoverClone) {
                        const rect = info.el.getBoundingClientRect();
                        const clone = info.el.cloneNode(true);
                        Object.assign(clone.style, {
                          position: "fixed",
                          left: `${rect.left}px`,
                          top: `${rect.top}px`,
                          width: "auto",
                          overflow: "visible",
                          whiteSpace: "pre",
                          textOverflow: "clip",
                          zIndex: "1000",
                        });
                        document.body.appendChild(clone);
                        info.el._hoverClone = clone;
                      }
                    });
                    info.el.addEventListener("mouseleave", () => {
                      if (info.el._hoverClone) {
                        document.body.removeChild(info.el._hoverClone);
                        info.el._hoverClone = null;
                      }
                    });
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Grade summary section */}
          <Grid size={12}>
            <GradeSection grades={grades} />
          </Grid>
        </Grid>

        {/* Right column: preview of upcoming events */}
        <Grid size={4}>
          <PreviewSection events={previewEvents} />
        </Grid>
      </Grid>
    </Box>
  );
}
