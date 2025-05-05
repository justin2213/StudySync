/**
 * HeroSection Component
 * ---------------------
 * Renders the hero section of the StudySync landing page, including:
 * - A responsive title and subtitle
 * - A primary call-to-action button invoking a passed-in loginFunction
 * - Key statistics displayed beneath the CTA
 *
 * Utilizes Material UI components for layout and styling,
 * and imports custom CSS for additional styling rules.
 */

import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import "../../styles/hero-section.css"; // Custom styles for hero section

/**
 * HeroSection functional component.
 * @param {Object} props
 * @param {Function} props.loginFunction - Function to call when CTA button is clicked
 * @returns {JSX.Element} The rendered hero section component.
 */
export default function HeroSection({ loginFunction }) {
  const theme = useTheme(); // Access MUI theme for responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Determine if viewport is mobile size

  return (
    <Box className="hero-section">
      <Container maxWidth="lg">
        {/* Wrapper adjusts based on mobile or desktop layout */}
        <Box
          className={
            isMobile ? "hero-content-wrapper-mobile" : "hero-content-wrapper"
          }
        >
          {/* Main headline with gradient text effect */}
          <Typography
            variant="h1"
            component="h1"
            className="hero-title gradient-text"
            align="center"
          >
            Sync Your Studies, Ace Your Future
          </Typography>

          {/* Subheading describing the product */}
          <Typography
            variant="h5"
            component="p"
            color="text.secondary"
            className="hero-description"
            align="center"
          >
            StudySync helps students organize their academic life with smart
            scheduling, grade tracking, and productivity tools designed for the
            modern learner.
          </Typography>

          {/* Call-to-action button */}
          <Box className="hero-cta-container">
            <Button
              variant="contained"
              color="primary"
              size="large"
              className="hero-cta cta-button"
              endIcon={<ArrowForwardIcon />} // Arrow icon at end of button
              sx={{ marginTop: 2 }}
              onClick={loginFunction}
            >
              Get Started — It's Free
            </Button>
          </Box>

          {/* Statistics section showing key metrics */}
          <Box className="hero-stats">
            <div className="hero-stat-item">
              <span className="hero-stat-number">10k+</span>
              <span className="hero-stat-label">Active Users</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">4.8</span>
              <span className="hero-stat-label">User Rating</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">24/7</span>
              <span className="hero-stat-label">Support</span>
            </div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
