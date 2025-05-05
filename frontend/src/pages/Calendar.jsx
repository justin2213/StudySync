import React, { useRef, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import CalendarToolbar from "../components/Calendar/CalendarToolbar.jsx";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import dayjs from "dayjs";
import Divider from "@mui/material/Divider";
import { Draggable } from "@fullcalendar/interaction";
import UnassignedSection from "../components/Calendar/UnassignedSection.jsx";
import UpcomingSection from "../components/Calendar/UpcomingSection.jsx";
import { useTheme } from "@mui/material/styles";
import { useSession } from "@supabase/auth-helpers-react";
import EditTaskModal from "../components/EditTaskModal/EditTaskModal.jsx";
import LoadingIndicator from "../components/Loading.jsx";

/**
 * Calendar component that renders an interactive calendar with event management capabilities.
 *
 * This component:
 * - Retrieves and displays events from the backend for the logged-in user.
 * - Handles various event types (e.g., deadlines, assignments, classes, meetings, other) with specific styling.
 * - Implements drag-and-drop functionality for reordering and updating event times.
 * - Supports event creation, updates via an edit modal, deletion, and marking events complete/incomplete.
 * - Differentiates unassigned events and upcoming events, displaying them in dedicated sections.
 * - Utilizes FullCalendar with plugins (dayGridPlugin, timeGridPlugin, interactionPlugin) to render the calendar interface.
 * - Integrates with Material UI for theming and UI consistency.
 *
 * @component
 * @returns {JSX.Element} The rendered Calendar component.
 */
function Calendar() {
  const calendarRef = useRef(null);
  const unassignedRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [view, setView] = useState("timeGridWeek");
  const draggableInitializedRef = useRef(false);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const { user } = useSession();
  const userID = user?.id;

  useEffect(() => {
    if (!userID) return;

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/tasks/calendar/${userID}`,
        );
        console.log(response.data.events);
        const events = response.data.events;
        setEvents(events);
      } catch (err) {
        setError(err.response?.data || "Error fetching events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userID]);

  const unassignedEvents = useMemo(() => {
    return events.filter((event) => !event.start && !event.end);
  }, [events]);

  const calendarEvents = useMemo(() => {
    return (
      events
        // 1) Transform deadline events
        .map((event) => {
          if (event.isDeadline) {
            // Make it an all-day event with zero duration
            const formattedTime = dayjs(event.end).format("hh:mm A");
            return {
              ...event,
              allDay: true,
              start: event.end, // same date as start for zero duration
              title: `${formattedTime} - ${event.title}`,
            };
          }
          return event;
        })
        // 2) Filter out items that don't have a start
        //    (and now deadlines have an end = start)
        .filter((event) => event.start)
    );
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return events
      .filter((event) => {
        const start = event.start ? new Date(event.start) : null;
        return (
          !event.completed &&
          !event.isDeadline &&
          start &&
          start > now && // Event starts after the current time
          start <= sevenDaysLater && // Event starts within the next 7 days
          event.type !== "class"
        );
      })
      .sort((a, b) => {
        const aStart = a.start ? new Date(a.start).getTime() : Infinity;
        const bStart = b.start ? new Date(b.start).getTime() : Infinity;
        return aStart - bStart;
      });
  }, [events]);

  useEffect(() => {
    if (!draggableInitializedRef.current && unassignedRef.current) {
      new Draggable(unassignedRef.current, {
        itemSelector: ".fc-external-event",
        eventData: (eventEl) => {
          // read data from the eventEl
          const jsonStr = eventEl.getAttribute("data-event");
          if (jsonStr) {
            try {
              return JSON.parse(jsonStr); // parse the data-event JSON
            } catch (e) {
              return { title: eventEl.innerText }; // fallback
            }
          }
          // Default: just use the text content
          return { title: eventEl.innerText };
        },
      });
      draggableInitializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      setCalendarApi(api);
      setCurrentTitle(api.view.title);
    }
  }, []);

  const handleDatesSet = (dateInfo) => {
    setCurrentTitle(dateInfo.view.title);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (calendarApi) {
      calendarApi.changeView(newView);
    }
  };

  const handleEventDrop = async (info) => {
    if (
      view === "dayGridMonth" ||
      info.event.extendedProps.type === "class" ||
      info.event.extendedProps.completed ||
      info.event.extendedProps.isDeadline
    ) {
      // Cancel the drop if in month view.
      info.revert();
      return;
    }

    // Get the new start time from the dropped event
    const eventStart = info.event.start ? new Date(info.event.start) : null;

    // If the new start is in the past, revert the drop and exit
    if (eventStart && eventStart < new Date()) {
      info.revert();
      return;
    }
    // When an event is dropped in a new time slot
    const updatedEventId = info.event.id; // assuming your event's id is set
    console.log(updatedEventId);
    const newStart = info.event.start ? info.event.start.toISOString() : null;
    const newEnd = info.event.end ? info.event.end.toISOString() : null;

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/tasks/time`,
        {
          id: info.event.id,
          start: newStart,
          end: newEnd,
        },
      );

      if (response.status === 200) {
        // Update the state so that the event now has start and end times
        setEvents((prevEvents) =>
          prevEvents.map((ev) =>
            ev.id === updatedEventId
              ? { ...ev, start: newStart, end: newEnd }
              : ev,
          ),
        );
      } else {
        console.error("Error updating event times:", response.data);
        info.revert();
        return;
      }
    } catch (error) {
      console.error("Error updating events times:", error);
    }
  };

  const handleEventReceive = async (info) => {
    if (view === "dayGridMonth") {
      // Cancel the drop if in month view.
      info.revert();
      return;
    }

    // Get the new start time from the dropped event
    const eventStart = info.event.start ? new Date(info.event.start) : null;

    // If the new start is in the past, revert the drop and exit
    if (eventStart && eventStart < new Date()) {
      info.revert();
      return;
    }
    // Extract the event id (make sure the external event data includes an id)
    const receivedEventId = info.event.id;
    const newStart = info.event.start ? info.event.start.toISOString() : null;
    const newEnd = info.event.end ? info.event.end.toISOString() : null;

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/tasks/time`,
        {
          id: info.event.id,
          start: newStart,
          end: newEnd,
        },
      );

      if (response.status === 200) {
        // Update the state so that the event now has start and end times
        setEvents((prevEvents) =>
          prevEvents.map((ev) =>
            ev.id === receivedEventId
              ? { ...ev, start: newStart, end: newEnd }
              : ev,
          ),
        );
      } else {
        console.error("Error updating event times:", response.data);
        info.revert();
        return;
      }
    } catch (error) {
      console.error("Error updating events times:", error);
    }
  };

  const deleteEvents = async (eventIDs) => {
    try {
      // Axios delete with a request body: note the config parameter with `data`
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/tasks/delete`, {
        data: { taskIDs: eventIDs },
      });

      // Update the tasks state to remove the deleted tasks
      setEvents((prevEvents) =>
        prevEvents.filter((event) => !eventIDs.includes(event.id)),
      );
    } catch (error) {
      console.error("Error deleting events:", error);
      setError(error);
    }
  };

  const markComplete = async (eventIDs) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/tasks/complete`,
        { taskIDs: eventIDs, setComplete: true },
      );

      if (response.status === 200) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            eventIDs.includes(event.id) ? { ...event, completed: true } : event,
          ),
        );

        // After updating state, manually update DOM for completed events
        eventIDs.forEach((id) => {
          const eventEl = document.querySelector(`[data-event-id="${id}"]`);
          if (eventEl) {
            eventEl.style.textDecoration = "line-through";
          }
        });
      } else {
        console.error("Error marking events complete:", response.data);
      }
    } catch (error) {
      console.error("Error marking events complete:", error);
    }
  };

  const markIncomplete = async (eventIDs) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/tasks/complete`,
        { taskIDs: eventIDs, setComplete: false },
      );

      if (response.status === 200) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            eventIDs.includes(event.id)
              ? { ...event, completed: false }
              : event,
          ),
        );

        // After updating state, manually update DOM for incomplete events
        eventIDs.forEach((id) => {
          const eventEl = document.querySelector(`[data-event-id="${id}"]`);
          if (eventEl) {
            eventEl.style.textDecoration = "none";
          }
        });
      } else {
        console.error("Error marking events incomplete:", response.data);
      }
    } catch (error) {
      console.error("Error marking events incomplete:", error);
    }
  };

  const updateEvent = (updatedEvent) => {
    // Update the events state
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        updatedEvent.id === event.id ? updatedEvent : event,
      ),
    );

    // Manually update the event element's background color using a query selector.
    const eventEl = document.querySelector(
      `[data-event-id="${updatedEvent.id}"]`,
    );
    if (eventEl) {
      let newBackgroundColor;
      // Repudiate (reset) the event color based on the event type:
      switch (updatedEvent.type) {
        case "assignment":
          newBackgroundColor = theme.palette.success.main;
          break;
        case "class":
          newBackgroundColor = theme.palette.primary.main;
          break;
        case "meeting":
          newBackgroundColor = theme.palette.warning.main;
          break;
        case "other":
        default:
          newBackgroundColor = theme.palette.grey[500];
          break;
      }
      eventEl.style.backgroundColor = newBackgroundColor;
      eventEl.style.borderColor = newBackgroundColor;
    }
  };

  const handleEventClick = (info) => {
    if (
      info.event.extendedProps.type === "class" ||
      info.event.extendedProps.isDeadline
    ) {
      return;
    }

    console.log(info.event.extendedProps);

    // Convert the event start and end to dayjs objects
    const task = {
      taskID: info.event.id,
      taskName: info.event.title,
      taskType: info.event.extendedProps.type,
      taskStart: info.event.start ? dayjs(info.event.start) : null,
      taskEnd: info.event.end ? dayjs(info.event.end) : null,
      taskDescription: info.event.extendedProps.description,
      taskClass: info.event.extendedProps.classID,
      classTitle: info.event.extendedProps.classTitle,
      semesterName: info.event.extendedProps.semesterName,
      taskSemester: info.event.extendedProps.semesterID,
      completed: info.event.extendedProps.completed,
    };
    console.log(task);
    setSelectedTask(task);
    setShowUpdateModal(true);
  };

  const handleUpdateModalClose = () => {
    setShowUpdateModal(false);
    setSelectedTask(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {showUpdateModal && (
        <EditTaskModal
          open={showUpdateModal}
          task={selectedTask}
          setTask={setSelectedTask}
          handleClose={handleUpdateModalClose}
          markComplete={markComplete}
          markIncomplete={markIncomplete}
          updateEvent={updateEvent}
        />
      )}
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
      <Typography level="h1" component="h1" sx={{ fontWeight: "bold", p: 2 }}>
        Calendar
      </Typography>
      <Grid container marginX={2}>
        <Grid container gap={2} size={12}>
          <Grid size={9}>
            <Box marginBottom={1}>
              <CalendarToolbar
                calendarApi={calendarApi}
                currentTitle={currentTitle}
                view={view}
                onViewChange={handleViewChange}
              />
              <FullCalendar
                timeZone="local"
                ref={calendarRef}
                height="550px"
                headerToolbar={false}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                dayMaxEvents={2}
                eventOverlap={(stillEvent, movingEvent) => {
                  if (stillEvent.extendedProps.isDeadline) {
                    return true;
                  }
                  // Otherwise, allow overlap only if the still event is completed.
                  return stillEvent.extendedProps.completed === true;
                }}
                eventOrder={(a, b) => {
                  // Compare the completed flags: incomplete events should come first.
                  if (a.extendedProps.completed === b.extendedProps.completed) {
                    // If both events have the same completed status, order by start time
                    return a.start - b.start;
                  }
                  return a.extendedProps.completed ? 1 : -1;
                }}
                droppable={true}
                editable={true}
                datesSet={handleDatesSet}
                allDayText="Deadlines"
                views={{
                  timeGridDay: { allDaySlot: true },
                  timeGridWeek: { allDaySlot: true },
                  dayGridMonth: {
                    editable: false,
                    eventStartEditable: false, // optional: disables start time dragging
                    eventDurationEditable: false, // optional: disables resizing events
                  },
                }}
                eventClick={handleEventClick}
                events={calendarEvents}
                eventDrop={handleEventDrop} // <-- update state on event drop
                eventReceive={handleEventReceive}
                eventDidMount={(info) => {
                  // Set a data attribute for later reference
                  info.el.dataset.eventId = info.event.id;

                  let backgroundColor;

                  if (info.event.extendedProps.isDeadline) {
                    // Use MUI's error color for deadlines
                    backgroundColor = theme.palette.error.main;
                  } else {
                    // Otherwise pick color based on event type
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
                      case "other":
                      default:
                        backgroundColor = theme.palette.grey[500];
                    }
                  }

                  // Base styling for the event in the calendar cell
                  info.el.style.backgroundColor = backgroundColor;
                  info.el.style.color = "white";
                  info.el.style.cursor = "pointer";
                  info.el.style.overflow = "hidden";
                  info.el.style.whiteSpace = "nowrap";
                  info.el.style.textOverflow = "ellipsis";
                  info.el.style.padding = "2px 2px";
                  info.el.style.fontSize = "12px";

                  // Make the border match the background color
                  info.el.style.borderColor = backgroundColor;
                  info.el.style.borderStyle = "solid";
                  info.el.style.borderWidth = "1px";

                  if (info.event.extendedProps.completed === true) {
                    info.el.style.textDecoration = "line-through";
                  }

                  // Store the hover clone reference on the element
                  info.el._hoverClone = null;

                  if (info.view.type !== "dayGridMonth") {
                    return; // skip the rest if not in month view
                  }
                  // On mouse enter, create a clone
                  info.el.addEventListener("mouseenter", () => {
                    if (!info.el._hoverClone) {
                      const rect = info.el.getBoundingClientRect();
                      const clone = info.el.cloneNode(true);
                      clone.style.position = "fixed";
                      clone.style.left = `${rect.left}px`;
                      clone.style.top = `${rect.top}px`;
                      clone.style.width = "auto";
                      clone.style.overflow = "visible";
                      clone.style.whiteSpace = "pre";
                      clone.style.textOverflow = "clip";
                      clone.style.zIndex = "1000";
                      document.body.appendChild(clone);
                      info.el._hoverClone = clone;
                    }
                  });

                  // On mouse leave, remove the clone
                  info.el.addEventListener("mouseleave", () => {
                    if (info.el._hoverClone) {
                      document.body.removeChild(info.el._hoverClone);
                      info.el._hoverClone = null;
                    }
                  });
                }}
              />
            </Box>
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "lightgray" }}
          />
          <Grid size={2}>
            <UnassignedSection
              unassignedRef={unassignedRef}
              unassignedEvents={unassignedEvents}
            />
          </Grid>
        </Grid>
        <Grid size={12} marginRight={2}>
          <Divider sx={{ borderColor: "gray" }} />
        </Grid>
        <Grid size={12} marginRight={2}>
          <UpcomingSection
            events={upcomingEvents}
            markComplete={markComplete}
            deleteEvents={deleteEvents}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Calendar;
