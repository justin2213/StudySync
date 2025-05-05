// src/App.jsx

// global styles
import "./styles/App.css";

// routing & UI libs
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

// components & pages
import Navbar from "./components/Navbar.jsx";
import AddButton from "./components/AddButton.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Calendar from "./pages/Calendar.jsx";
import Classes from "./pages/Classes.jsx";
import ClassPage from "./pages/ClassPage.jsx";
import Work from "./pages/Work.jsx";
import InfoPage from "./pages/Info.jsx";
import Login from "./pages/Login.jsx";

// Supabase auth hooks
import {
  useSession,
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";

// date-picker adapter
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Layout: navbar + current route + global add button
const Layout = ({ signOutFunction }) => (
  <>
    <Navbar signOutFunction={signOutFunction}>
      <Outlet />
    </Navbar>
    <AddButton />
  </>
);

function App() {
  // auth state & client
  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  if (isLoading) return null; // wait for auth

  // Google OAuth sign-in
  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { scopes: "openid email profile" },
    });
    if (error) alert("Error logging in with Google");
  }

  // sign-out handler
  async function signOut() {
    await supabase.auth.signOut();
  }

  // wrap Layout to pass signOut prop
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout signOutFunction={signOut} />,
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "/calendar", element: <Calendar /> },
        { path: "/classes", element: <Classes /> },
        { path: "/classes/:classID", element: <ClassPage /> },
        { path: "/work", element: <Work /> },
        { path: "/information", element: <InfoPage /> },
        { path: "*", element: <p>404 Page not found</p> },
      ],
    },
  ]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {session ? (
          <RouterProvider router={router} />
        ) : (
          <Login loginFunction={googleSignIn} />
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default App;
