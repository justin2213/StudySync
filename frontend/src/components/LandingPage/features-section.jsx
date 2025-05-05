// React hooks for state and lifecycle
import { useState, useEffect } from "react";
// Material UI components and hooks
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
// Icon components for feature representation
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
// CSS for the features section
import "../../styles/features-section.css";

// Array of feature definitions with icon, title, and description
const features = [
  {
    icon: <CalendarIcon fontSize="large" color="primary" />, // Calendar icon
    title: "Interactive Calendar",
    description:
      "Visualize your academic schedule with our intuitive calendar interface. Color-code events, set reminders, and never miss a deadline again.",
  },
  {
    icon: <ScheduleIcon fontSize="large" color="primary" />, // Scheduling icon
    title: "Smart Scheduling",
    description:
      "Easily add and manage classes, assignments, exams, and personal events. StudySync helps you balance your academic and personal life.",
  },
  {
    icon: <CalculateIcon fontSize="large" color="primary" />, // Calculator icon
    title: "Grade Calculator",
    description:
      "Track your academic performance with our advanced grade calculator. Set grade goals and see what you need to achieve them.",
  },
];

/**
 * FeaturesSection
 *
 * Renders a responsive section showcasing key app features:
 * - A floating calendar background effect that shifts on scroll.
 * - Section header with title and subtitle.
 * - Grid of feature cards (icon, title, description).
 *
 * Header and grid adapt for mobile using Material UI breakpoints.
 *
 * @returns {JSX.Element} The features section markup.
 */
export default function FeaturesSection() {
  // Access theme breakpoints for responsive behavior
  const theme = useTheme();
  // Determine if the viewport is below "md" breakpoint
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Track vertical scroll position for background animation
  const [scrollPosition, setScrollPosition] = useState(0);

  // Update scrollPosition on window scroll
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Compute horizontal offset (%) for the floating calendar
  const calendarPosition = Math.min(50, scrollPosition / 10);

  return (
    <Box id="features" className="features-section">
      {/* Floating calendar background effect */}
      <Box
        className="floating-calendar"
        style={{ right: `${-30 + calendarPosition}%` }}
      >
        <Box
          component="img"
          src="/placeholder.svg"
          alt="Background Calendar"
          className="calendar-image"
        />
      </Box>

      {/* Main container to center content */}
      <Container maxWidth="lg" className="features-container">
        {/* Section header: title and subtitle */}
        <Box
          className={isMobile ? "features-header-mobile" : "features-header"}
        >
          <Typography variant="h2" component="h2" className="features-title">
            Features Designed for Students
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            className="features-subtitle"
            align="center"
            sx={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}
          >
            StudySync combines powerful tools to help you stay organized,
            focused, and on track to achieve your academic goals.
          </Typography>
        </Box>

        {/* Feature cards grid; spacing adapts for mobile */}
        <Grid container spacing={isMobile ? 3 : 4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={0} className="feature-card">
                <CardContent className="feature-card-content">
                  {/* Icon for the feature */}
                  <Box className="feature-icon">{feature.icon}</Box>
                  {/* Feature title */}
                  <Typography
                    variant="h5"
                    component="h3"
                    className="feature-title"
                  >
                    {feature.title}
                  </Typography>
                  {/* Feature description */}
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    className="feature-description"
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
