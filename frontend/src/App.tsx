import AppRouter from "@/routes/AppRouter";
import Navbar from "@/layout/Navbar";
import { Box, Container, Typography } from "@mui/material";

function App() {
  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />
        <Container
          component="main"
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: { xs: 1, sm: 2, md: 3 },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <AppRouter />
        </Container>

        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            bgcolor: "grey.100",
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              py: { xs: 1, md: 2 },
              fontSize: { xs: 12, sm: 14, md: 16 },
            }}
          >
            © {new Date().getFullYear()} Warsztat Samochodowy - System
            Zarządzania
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default App;
