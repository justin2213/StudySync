/**
 * LandingPage Component
 * ---------------------
 * Wraps the main landing page of the StudySync application with theme and layout:
 * - Applies a custom Material UI theme via ThemeProvider
 * - Resets CSS defaults using CssBaseline
 * - Renders Header, HeroSection, FeaturesSection, and Footer components
 * - Uses a flex container to ensure footer sticks to the bottom
 *
 * @param {Object} props
 * @param {Function} props.loginFunction - Function passed down to Header and HeroSection for sign-in
 * @returns {JSX.Element} The full landing page layout
 */

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Header from "./header";
import HeroSection from "./hero-section";
import FeaturesSection from "./features-section";
import Footer from "./footer";
import { Box } from "@mui/material";
import "../../styles/landing-page.css"; // Custom styles for landing page layout

// Define the custom theme for StudySync
const theme = createTheme({
  palette: {
    primary: { main: "#3f51b5" }, // Primary brand color
    secondary: { main: "#f50057" }, // Secondary accent color
    background: { default: "#fafafa" }, // Default page background
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 }, // Strong emphasis for main headings
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners on buttons
          textTransform: "none", // Preserve case in button text
          fontWeight: 600, // Semi-bold text
          padding: "10px 24px", // Comfortable padding
        },
      },
    },
  },
});

/**
 * LandingPage functional component.
 * @param {Object} props
 * @param {Function} props.loginFunction - Function to handle user login
 */
export default function LandingPage({ loginFunction }) {
  return (
    <ThemeProvider theme={theme}>
      {/* Normalize CSS across browsers */}
      <CssBaseline />
      {/* Main container ensures footer stays at bottom */}
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Top navigation header */}
        <Header loginFunction={loginFunction} />
        {/* Main content area grows to fill space */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {/* Hero section with CTA */}
          <HeroSection loginFunction={loginFunction} />
          {/* Features overview section */}
          <FeaturesSection />
        </Box>
        {/* Page footer */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
