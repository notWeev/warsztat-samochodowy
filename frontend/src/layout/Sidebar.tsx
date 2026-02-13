import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  Inventory,
  People,
  DirectionsCar as CarIcon,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

const DRAWER_WIDTH = 240;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Zlecenia",
    path: "/orders",
    icon: <Assignment />,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Klienci",
    path: "/customers",
    icon: <People />,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Pojazdy",
    path: "/vehicles",
    icon: <CarIcon />,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Części",
    path: "/parts",
    icon: <Inventory />,
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    label: "Ustawienia",
    path: "/settings",
    icon: <Settings />,
    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "temporary";
}

export const Sidebar = ({
  open,
  onClose,
  variant = "permanent",
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === "temporary") {
      onClose();
    }
  };

  const drawerContent = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigate(item.path)}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                color: "primary.contrastText",
                "&:hover": {
                  backgroundColor: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  location.pathname === item.path
                    ? "inherit"
                    : "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
