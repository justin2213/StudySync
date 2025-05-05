import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import { useSession } from "@supabase/auth-helpers-react";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ClassCard from "../components/ClassCard";
import LoadingIndicator from "../components/Loading";
import dayjs from "dayjs";

/**
 * Classes
 *
 * Fetches and displays all semesters and their classes for the current user.
 * - Semesters are sorted so ongoing ones appear first, then by start date descending.
 * - Each semester lists its classes in a grid; classes can be deleted individually.
 * - Entire semesters can also be deleted.
 *
 * Uses Supabase session for user authentication.
 *
 * @component
 * @returns {JSX.Element} The classes overview page
 */
function Classes() {
  // State: list of semesters with their classes
  const [semesters, setSemesters] = useState([]);
  // State: loading indicator
  const [loading, setLoading] = useState(true);
  // State: error message if fetch/delete fails
  const [error, setError] = useState(null);

  // Supabase session object; extract current user ID
  const session = useSession();
  const userID = session?.user?.id;

  /**
   * Map of weekday names to unique single-letter abbreviations.
   * 'R' denotes Thursday, 'U' denotes Sunday.
   * @type {{ [day: string]: string }}
   */
  const uniqueAbbreviations = {
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "R",
    Friday: "F",
    Saturday: "S",
    Sunday: "U",
  };

  /**
   * Convert an array of full weekday names into their unique one-letter codes.
   * @param {string[]} days - e.g. ["Monday", "Wednesday", "Friday"]
   * @returns {string[]} e.g. ["M", "W", "F"]
   */
  const abbreviateDaysUniquely = (days) => {
    return days.map((day) => uniqueAbbreviations[day] || day.charAt(0));
  };

  /**
   * Delete a single class by its ID.
   * Updates state to remove the class and any empty semesters.
   *
   * @param {string} classID - ID of the class to delete
   */
  const handleClassDelete = async (classID) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/classes/${classID}`,
      );
      setSemesters((prev) =>
        prev
          .map((sem) => ({
            ...sem,
            classes: sem.classes.filter((c) => c.classID !== classID),
          }))
          .filter((sem) => sem.classes.length > 0),
      );
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data || "Delete failed");
    }
  };

  /**
   * Delete an entire semester by its ID.
   * Updates state to remove that semester.
   *
   * @param {string} semesterID - ID of the semester to delete
   */
  const handleSemesterDelete = async (semesterID) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/semesters/${semesterID}`,
      );
      setSemesters((prev) =>
        prev.filter((sem) => sem.semesterID !== semesterID),
      );
    } catch (err) {
      console.error("Delete semester failed", err);
      setError(err.response?.data || "Delete semester failed");
    }
  };

  /**
   * Fetch semesters and their classes for the current user.
   * - Parses all date fields into dayjs objects.
   * - Sorts: ongoing first, then by semesterStart descending.
   */
  useEffect(() => {
    if (!userID) return;

    const fetchSemesters = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/semesters/${userID}`,
        );

        // Convert UTC strings to local dayjs objects for semesters and classes
        const formattedSemesters = response.data.map((semester) => ({
          ...semester,
          semesterStart: dayjs(semester.semesterStart),
          semesterEnd: dayjs(semester.semesterEnd),
          classes: semester.classes.map((classInfo) => ({
            ...classInfo,
            classStart: dayjs.utc(classInfo.classStart, "HH:mm:ss").local(),
            classEnd: dayjs.utc(classInfo.classEnd, "HH:mm:ss").local(),
          })),
        }));

        const now = dayjs();

        // Sort: ongoing semesters first, then by start date (newest first)
        const sortedSemesters = formattedSemesters.sort((a, b) => {
          const aOngoing =
            a.semesterStart.isBefore(now) && a.semesterEnd.isAfter(now);
          const bOngoing =
            b.semesterStart.isBefore(now) && b.semesterEnd.isAfter(now);
          if (aOngoing && !bOngoing) return -1;
          if (bOngoing && !aOngoing) return 1;
          return b.semesterStart.valueOf() - a.semesterStart.valueOf();
        });

        setSemesters(sortedSemesters);
      } catch (err) {
        setError(err.response?.data || "Error fetching semesters");
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, [userID]);

  // Show loading overlay while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 75,
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
    );
  }

  // Show error message if any operation failed
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  // Main render: list semesters and their classes
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography level="h1" component="h1" sx={{ fontWeight: "bold", p: 2 }}>
        Classes
      </Typography>
      <Grid container marginLeft={4} spacing={4}>
        {semesters.map((semester, i) => (
          <Grid key={i} size={12}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Stack direction="row" spacing={1} alignItems={"center"}>
                  <Typography level="h4" sx={{ fontWeight: "bold" }}>
                    {semester.semesterName}
                  </Typography>
                  <Typography level="title-sm" sx={{ fontStyle: "italic" }}>
                    {semester.semesterStart.format("MMM YYYY")}
                    {" - "}
                    {semester.semesterEnd.format("MMM YYYY")}
                  </Typography>
                </Stack>
                <IconButton
                  onClick={() => handleSemesterDelete(semester.semesterID)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Grid container spacing={2} paddingLeft={2} columns={20}>
                {semester.classes.map((classInfo, index) => (
                  <Grid
                    xs={4} // 4/20 columns = 5 cards per row
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ClassCard
                      classInfo={classInfo}
                      deleteClass={handleClassDelete}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Classes;
