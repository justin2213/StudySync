import LandingPage from "../components/LandingPage/landing-page";

/**
 * Login.jsx
 *
 * A simple wrapper component that renders the LandingPage and
 * passes through a login function prop.
 *
 */
export default function Login({ loginFunction }) {
  return <LandingPage loginFunction={loginFunction} />;
}
