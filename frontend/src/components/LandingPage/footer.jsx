/**
 * Footer Component
 * ----------------
 * This component renders the footer section of the StudySync application. It includes:
 * - A brief description of the product
 * - Copyright information
 * - Navigation links organized by category
 * - Contact information and address
 *
 * It leverages Material UI components for layout and styling,
 * and imports custom CSS for additional styling rules.
 */

import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import "../../styles/footer.css"; // Custom styles for the footer

/**
 * Array of link sections to display in the footer.
 * Each section has a title and an array of link objects.
 */
const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
];

/**
 * Footer functional component.
 * Uses Material UI theming hooks to adjust layout for mobile view.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
export default function Footer() {
  const theme = useTheme(); // Access the current theme
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Determine if viewport is mobile

  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Description and copyright section */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography
                variant="body2"
                color="text.secondary"
                className="footer-description"
              >
                StudySync helps students organize their academic life with smart
                scheduling, grade tracking, and productivity tools.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="copyright"
              >
                © {new Date().getFullYear()} StudySync. All rights reserved.
              </Typography>
            </Stack>
          </Grid>

          {/* Dynamic link sections */}
          {footerLinks.map((section) => (
            <Grid item xs={12} sm={6} md={2} lg={2} key={section.title}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                className="footer-section-title"
              >
                {section.title}
              </Typography>
              <Box component="ul" className="footer-links">
                {section.links.map((link) => (
                  <Box
                    component="li"
                    key={link.name}
                    className="footer-link-item"
                  >
                    <MuiLink
                      component="a"
                      href={link.href}
                      color="text.secondary"
                      underline="hover"
                      className="footer-link"
                    >
                      {link.name}
                    </MuiLink>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Contact information section */}
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              className="footer-section-title"
            >
              Contact
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="contact-info"
            >
              hello@studysync.com
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="contact-info"
            >
              123 Education St, Learning City
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
