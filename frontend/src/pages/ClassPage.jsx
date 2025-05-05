import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSession } from "@supabase/auth-helpers-react";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import FormControlLabel from "@mui/material/FormControlLabel";
import GradeTable from "../components/GradeTable/GradeTable";
import LoadingIndicator from "../components/Loading";
import Switch from "@mui/material/Switch";

/**
 * ClassPage
 *
 * Fetches and displays detailed information about a single class:
 * - Class times and days
 * - Animated gauge of total grade
 * - Breakdown of grade categories and assignments
 * - “What If” toggle to simulate grade changes
 *
 * URL Parameter:
 * @param {string} classID - the ID of the class from the route
 *
 * Uses Supabase session to identify the current user.
 *
 * @component
 * @returns {JSX.Element} the class detail page
 */
function ClassPage() {
  // Retrieve the classID from URL parameters
  const { classID } = useParams();

  // Supabase session for current user
  const session = useSession();
  const userID = session?.user?.id;

  // Local component state
  const [totalGrade, setTotalGrade] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [isWhatIf, setWhatIf] = useState(false);
  const [whatIfGrades, setWhatIfGrades] = useState(null);
  const [animatedValue, setAnimatedValue] = useState(0);

  /**
   * getColorForValue
   *
   * Maps a percentage (0–100) to an RGB color on a red→yellow→green gradient.
   *
   * @param {number} value - the percentage value
   * @returns {string} CSS rgb color string
   */
  const getColorForValue = (value) => {
    value = Math.max(0, Math.min(value, 100));
    if (value <= 75) {
      const ratio = value / 75;
      const green = Math.round(ratio * 200);
      return `rgb(255, ${green}, 0)`;
    } else {
      const ratio = (value - 75) / 25;
      const red = Math.round(255 * (1 - ratio));
      return `rgb(${red}, 200, 0)`;
    }
  };

  /**
   * fetchClassData
   *
   * GETs class details from backend, parses times via dayjs,
   * and stores in `classInfo`. Manages loading and error states.
   */
  const fetchClassData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/classes/${classID}`,
      );
      const formattedClass = {
        ...response.data,
        classStart: dayjs.utc(response.data.classStart, "HH:mm:ss").local(),
        classEnd: dayjs.utc(response.data.classEnd, "HH:mm:ss").local(),
      };
      setClassInfo(formattedClass);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching classes");
    } finally {
      setLoading(false);
    }
  };

  /**
   * calculateTotalGrade
   *
   * Calculates weighted average of all grade categories.
   * Uses `whatIfGrades` if “What If” toggle is active.
   * Updates `totalGrade` state as a percentage.
   */
  const calculateTotalGrade = () => {
    if (!classInfo?.grades) return 0;
    const gradesArray = isWhatIf ? whatIfGrades : classInfo.grades;
    if (!gradesArray) return 0;

    let totalWeighted = 0;
    let totalWeight = 0;

    for (const category of gradesArray) {
      let points = 0;
      let maxPts = 0;
      for (const assignment of category.grades) {
        const s = parseFloat(assignment.score) || 0;
        const m = parseFloat(assignment.maxScore) || 0;
        if (m <= 0 || s < 0) continue;
        points += s;
        maxPts += m;
      }
      if (maxPts > 0) {
        totalWeighted += (points / maxPts) * category.weight;
        totalWeight += category.weight;
      }
    }
    if (totalWeight === 0) return 0;
    setTotalGrade((totalWeighted / totalWeight) * 100);
  };

  // Initial data fetch when userID or classID changes
  useEffect(() => {
    if (!userID) return;
    fetchClassData();
  }, [userID, classID]);

  // Recalculate grade whenever class data or simulated grades change
  useEffect(() => {
    calculateTotalGrade();
  }, [classInfo, whatIfGrades]);

  // Animate the gauge needle from 0 to the computed totalGrade
  useEffect(() => {
    if (!classInfo) return;
    let startTime;
    const duration = 500; // ms
    function animate(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedValue(progress * totalGrade);
      if (progress < 1) window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);
  }, [classInfo, totalGrade]);

  /**
   * handleWhatIfChange
   *
   * Toggles “What If” mode. If enabling, clones existing grades
   * so the table edits do not overwrite original data.
   */
  const handleWhatIfChange = (e) => {
    if (e.target.checked) {
      setWhatIfGrades(JSON.parse(JSON.stringify(classInfo.grades)));
    } else {
      setWhatIfGrades(null);
    }
    setWhatIf(e.target.checked);
  };

  // Compute gauge arc color based on animated value
  const arcColor = getColorForValue(animatedValue);

  // Show loading overlay if still fetching
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

  // Show error text if fetch failed
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header: Class name, times, and days */}
      <Stack
        direction="row"
        spacing={0}
        sx={{ p: 2, justifyContent: "space-between", alignItems: "baseline" }}
      >
        <Typography level="h1" component="h1" sx={{ fontWeight: "bold" }}>
          {classInfo.className}
        </Typography>
        <Stack spacing={0}>
          <Typography variant="body2" color="text.secondary">
            {classInfo.classStart.format("h:mm A")} –{" "}
            {classInfo.classEnd.format("h:mm A")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {classInfo.classDays.join(", ")}
          </Typography>
        </Stack>
      </Stack>

      {/* Gauge + Grades Table */}
      <Grid container marginLeft={4} marginRight={4} spacing={4} marginTop={2}>
        <Grid
          size={12}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Gauge
            value={animatedValue}
            valueMax={100}
            startAngle={-110}
            endAngle={110}
            sx={{
              width: 150,
              height: 150,
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 40,
                fontWeight: "bold",
                transform: "translate(0px, 0px)",
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: arcColor,
              },
            }}
            text={({ value }) => `${Math.round(value)}%`}
          />
        </Grid>
        <Grid size={12}>
          {/* Grades section with “What If” toggle */}
          <Stack direction="column">
            <Stack direction="row" justifyContent="space-between">
              <Typography level="title-lg" sx={{ fontWeight: "bold", p: 2 }}>
                Grades
              </Typography>
              <FormControlLabel
                control={
                  <Switch checked={isWhatIf} onChange={handleWhatIfChange} />
                }
                label="What If"
              />
            </Stack>
            <GradeTable
              grades={isWhatIf ? whatIfGrades : classInfo.grades}
              isWhatIf={isWhatIf}
              setWhatIfGrades={setWhatIfGrades}
              fetchClassData={fetchClassData}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClassPage;
