import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemText from "@mui/material/ListItemText";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QuizIcon from "@mui/icons-material/Quiz";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ClassIcon from "@mui/icons-material/Class";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const drawerWidth = 240;

/**
 * Navbar
 *
 * Renders the main application navigation bar and side drawer.
 * - Top AppBar with logo, title, and user info (name & avatar)
 * - Permanent side Drawer containing navigation links and logout button
 * - Footer text in the drawer
 * - Wraps children content in the main area with proper padding
 *
 * Props:
 * @param {React.ReactNode} children - The content to display next to the drawer
 * @param {Function} signOutFunction - Callback to sign the user out
 *
 * @component
 * @returns {JSX.Element} The navbar layout
 */
function Navbar({ children, signOutFunction }) {
  // Retrieve user session metadata
  const session = useSession();

  // Define navigation buttons: label, icon, and route path
  const buttons = {
    Dashboard: { icon: <DashboardIcon />, path: "/" },
    Calendar: { icon: <CalendarMonthIcon />, path: "/calendar" },
    "Work To Do": { icon: <RateReviewIcon />, path: "/work" },
    Classes: { icon: <ClassIcon />, path: "/classes" },
    Information: { icon: <QuizIcon />, path: "/information" },
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Normalize baseline styling */}
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#4652b7",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo and app title */}
          <Stack direction="row" spacing={2} alignItems="center">
            <img
              alt="StudySync"
              width="50"
              src={require("../logo.svg").default}
            />
            <Typography variant="h6" noWrap component="div" id="header">
              StudySync
            </Typography>
          </Stack>

          {/* User info: name and avatar */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1">
              {session.user.user_metadata.full_name}
            </Typography>
            <Avatar
              alt={session.user.user_metadata.full_name}
              src={session.user.user_metadata.picture}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Side drawer: navigation links & logout */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box>
          {/* Spacer for fixed AppBar */}
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            {/* Main navigation list */}
            <List>
              {Object.entries(buttons).map(([label, { icon, path }]) => (
                <ListItem key={label} disablePadding>
                  <ListItemButton component={Link} to={path}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Divider and logout button */}
            <Divider sx={{ borderColor: "gray" }} />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={signOutFunction}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>

        {/* Drawer footer text */}
        <Box paddingBottom={2} paddingLeft={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1}
          >
            © {new Date().getFullYear()} StudySync. All rights reserved.
          </Typography>
        </Box>
      </Drawer>

      {/* Main content area: children rendered here */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Spacer for fixed AppBar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Navbar;
