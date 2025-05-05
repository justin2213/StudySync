import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CalculateOutlined,
  CalendarMonthOutlined,
  ScheduleOutlined,
} from "@mui/icons-material";
import "../styles/InfoPage.css";

/**
 * A static information page that presents:
 * 1. The project team members ("creators") with their roles.
 * 2. Key features of the application, each with an icon and placeholder for a video demo.
 * 3. A footer with copyright information.
 *
 * Utilizes Material-UI components for layout, styling, and responsive behavior.
 *
 * @component
 * @returns {JSX.Element} The fully composed info page.
 */

/**
 * An array of team member objects.
 * @type {Array<{ name: string, role: string }>}
 */
const creators = [
  { name: "Justin", role: "Team Lead/Full Stack Developer" },
  { name: "Keagan", role: "Frontend Developer" },
  { name: "Vincent", role: "Backend Developer" },
  { name: "Zach", role: "UI/UX Designer" },
  { name: "Patrick", role: "Database Manager" },
];

/**
 * An array of feature definitions to display on the page.
 * @type {Array<{
 *   title: string,
 *   description: string,
 *   icon: JSX.Element,
 *   videoPlaceholder: string
 * }>}
 */
const features = [
  {
    title: "Grade Calculator",
    description:
      "Calculate your current and potential grades with our advanced grade calculator. Track your academic progress and set goals for improvement.",
    icon: <CalculateOutlined fontSize="large" />,
    videoPlaceholder: "Grade Calculator Demo",
  },
  {
    title: "Schedule Tracking",
    description:
      "Keep track of your classes, assignments, and deadlines with our intuitive schedule tracking system. Never miss an important deadline again.",
    icon: <ScheduleOutlined fontSize="large" />,
    videoPlaceholder: "Schedule Tracking Demo",
  },
  {
    title: "Calendar",
    description:
      "Visualize your academic schedule with our comprehensive calendar. Plan ahead and manage your time effectively throughout the semester.",
    icon: <CalendarMonthOutlined fontSize="large" />,
    videoPlaceholder: "Calendar Demo",
  },
];

export default function InfoPage() {
  // Access theme breakpoints for responsive queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box className="info-page">
      {/* Creators Section */}
      <Container maxWidth="lg" className="section">
        <Typography variant="h2" className="section-title">
          Meet Our Team
        </Typography>
        <Divider className="section-divider" />

        <Grid
          container
          spacing={4}
          justifyContent="center"
          className="creators-grid"
        >
          {creators.map((creator, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card className="creator-card">
                <CardContent className="creator-card-content">
                  <Avatar className="creator-avatar">
                    {creator.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" className="creator-name">
                    {creator.name}
                  </Typography>
                  <Typography variant="body2" className="creator-role">
                    {creator.role}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box className="features-background">
        <Container maxWidth="lg" className="section">
          <Typography variant="h2" className="section-title">
            Our Features
          </Typography>
          <Divider className="section-divider" />

          <Grid container spacing={isMobile ? 4 : 8} className="features-grid">
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className="feature-card">
                  <CardContent className="feature-card-content">
                    <Box className="feature-icon">{feature.icon}</Box>
                    <Typography variant="h5" className="feature-title">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="feature-description">
                      {feature.description}
                    </Typography>
                  </CardContent>

                  {/* Video Demo Section */}
                  <Paper elevation={3} className="video-container">
                    <Box className="video-placeholder">
                      <Typography variant="body1">
                        {feature.videoPlaceholder}
                      </Typography>
                      <Typography variant="caption">
                        Video demo will be displayed here
                      </Typography>
                    </Box>
                  </Paper>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="footer">
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} StudySync. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
