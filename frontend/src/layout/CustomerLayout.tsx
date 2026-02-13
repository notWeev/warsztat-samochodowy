import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Dashboard,
  DirectionsCar,
  Assignment,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const customerNavItems = [
  { label: "Dashboard", path: "/customer/dashboard", icon: <Dashboard /> },
  {
    label: "Moje pojazdy",
    path: "/customer/vehicles",
    icon: <DirectionsCar />,
  },
  { label: "Zlecenia", path: "/customer/orders", icon: <Assignment /> },
  { label: "Profil", path: "/customer/profile", icon: <AccountCircle /> },
];

const CustomerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = customerNavItems.findIndex(
    (item) => item.path === location.pathname,
  );

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", sm: "none" },
        zIndex: (theme) => theme.zIndex.appBar,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex}
        onChange={(_, newValue) => {
          navigate(customerNavItems[newValue].path);
        }}
        showLabels
      >
        {customerNavItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export const CustomerLayout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar showMenuButton={false} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: "background.default",
          minHeight: "100vh",
          pb: { xs: 10, sm: 3 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />
    </Box>
  );
};
