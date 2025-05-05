/**
 * Header Component
 * ----------------
 * Renders the navigation bar and responsive drawer menu for the StudySync application.
 * Features:
 * - Logo display
 * - Navigation links (Features, About Us, Contact)
 * - Google sign-in button invoking a passed-in loginFunction
 * - Responsive behavior: AppBar with buttons on desktop, Drawer menu on mobile
 *
 * Utilizes Material UI components and styling, with custom CSS for header.
 */

import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon, Google as GoogleIcon } from "@mui/icons-material";
import logo from "../../logo.svg";
import "../../styles/header.css"; // Custom styles for header container and elements

/**
 * Navigation items to display in the header and drawer.
 * Each item has a display name and link href.
 */
const navItems = [
  { name: "Features", href: "#features" },
  { name: "About Us", href: "#about" },
  { name: "Contact", href: "#contact" },
];

/**
 * Header functional component.
 * @param {Object} props
 * @param {Function} props.loginFunction - Function to call when 'Sign in' is clicked
 * @returns {JSX.Element} The rendered header component.
 */
export default function Header({ loginFunction }) {
  const [mobileOpen, setMobileOpen] = useState(false); // Drawer open state for mobile
  const theme = useTheme(); // Access MUI theme for breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Check if viewport is mobile size

  /**
   * Toggles the mobile drawer open/closed state.
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /**
   * Drawer content for mobile navigation.
   */
  const drawer = (
    <Box
      onClick={handleDrawerToggle} // Close drawer when clicking any link
      sx={{
        textAlign: "center",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {/* Logo at top of drawer */}
      <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
        <img src={logo} alt="StudySync Logo" width={120} height={40} />
      </Box>
      <List>
        {/* Map through nav items for drawer links */}
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component="a"
              href={item.href}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Sign-in button using passed loginFunction */}
        <ListItem disablePadding>
          <ListItemButton onClick={loginFunction} sx={{ textAlign: "center" }}>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <GoogleIcon fontSize="small" />
                  Sign in
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box className="header-container">
      {/* Top AppBar with transparent background */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className="app-bar"
        sx={{ display: "flex" }}
      >
        <Container disableGutters maxWidth={false} sx={{ flexGrow: 1 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* Logo on the left side of AppBar */}
            <Box className="logo-container">
              <img src={logo} alt="StudySync Logo" width={120} height={40} />
            </Box>

            {/* Conditional rendering: menu icon on mobile, inline links on desktop */}
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                className="menu-button"
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box className="nav-links">
                {/* Desktop navigation links */}
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    component="a"
                    href={item.href}
                    color="inherit"
                    className="nav-link"
                  >
                    {item.name}
                  </Button>
                ))}
                {/* Desktop sign-in button */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<GoogleIcon />}
                  onClick={loginFunction}
                  className="signin-button"
                >
                  Sign in
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer for navigation */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Improves performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
