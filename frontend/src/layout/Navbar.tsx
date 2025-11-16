import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import BuildIcon from "@mui/icons-material/Build";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";

export default function Navbar() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { path: "/", label: "Główna", icon: <HomeIcon /> },
    { path: "/orders", label: "Zlecenia", icon: <AssignmentIcon /> },
    { path: "/parts", label: "Części", icon: <InventoryIcon /> },
    { path: "/customers", label: "Klienci", icon: <PeopleIcon /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AppBar position="static">
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 3, sm: 8 },
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontSize: { xs: "1rem", sm: "1.35rem" },
            }}
          >
            <BuildIcon sx={{ mr: 3 }} />
            {isMobile ? "Warsztat" : "Warsztat Samochodowy"}
          </Typography>

          {/* Mobile Hamburger menu */}
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {menuItems.map((item) => (
              <Box
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 4,
                  py: 3,
                  color: "inherit",
                  textDecoration: "none",
                  borderRadius: 1,
                  backgroundColor: isActive(item.path)
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                {item.icon}
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  backgroundColor: isActive(item.path)
                    ? "action.selected"
                    : "transparent",
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
