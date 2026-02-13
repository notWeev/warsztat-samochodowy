import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { Dashboard, Assignment, People, Inventory } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
  { label: "Zlecenia", path: "/orders", icon: <Assignment /> },
  { label: "Klienci", path: "/customers", icon: <People /> },
  { label: "Części", path: "/parts", icon: <Inventory /> },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = navItems.findIndex(
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
          navigate(navItems[newValue].path);
        }}
        showLabels
      >
        {navItems.map((item) => (
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
