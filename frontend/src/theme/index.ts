import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0, // Mobile portrait
      sm: 600, // Mobile
      md: 960, // Tablet
      lg: 1280, // Desktop
      xl: 1920, // Large desktop
    },
  },

  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#f57c00",
      light: "#ffb74d",
      dark: "#ef6c00",
    },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    error: { main: "#f44336" },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "1.75rem",
      fontWeight: 300,
      "@media (min-width:600px)": {
        fontSize: "2.125rem",
      },
      "@media (min-width:960px)": {
        fontSize: "2.5rem",
      },
    },

    h4: {
      fontSize: "1.25rem",
      fontWeight: 500,
      "@media (min-width:600px)": {
        fontSize: "1.5rem",
      },
    },

    h6: {
      fontSize: "1rem",
      fontWeight: 500,
      "@media (min-width:600px)": {
        fontSize: "1.125rem",
      },
    },

    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      "@media (min-width:600px)": {
        fontSize: "1rem",
      },
    },

    button: {
      textTransform: "none",
      fontSize: "0.875rem",
      "@media (min-width:600px)": {
        fontSize: "1rem",
      },
    },
  },

  spacing: 4,

  shape: { borderRadius: 4 },

  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "8px",
          paddingRight: "8px",
          "@media (min-width:600px)": {
            paddingLeft: "16px",
            paddingRight: "16px",
          },
          "@media (min-width:960px)": {
            paddingLeft: "24px",
            paddingRight: "24px",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: "44px",
          padding: "8px 16px",
          "@media (min-width:600px)": {
            minHeight: "36px",
            padding: "6px 16px",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          height: "56px",
          "@media (min-width:600px)": {
            height: "64px",
          },
        },
      },
    },
  },
});

export default theme;
