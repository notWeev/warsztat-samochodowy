import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  DirectionsCar,
  AccountCircle,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useAuth } from "../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const TopBar = ({ onMenuClick, showMenuButton = true }: TopBarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = () => {
    if (!user || !user.firstName || !user.lastName) return "?";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "primary.main",
      }}
    >
      <Toolbar>
        {/* Menu button (mobile) */}
        {showMenuButton && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <DirectionsCar sx={{ mr: 2, display: { xs: "none", sm: "block" } }} />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          Warsztat Samochodowy
        </Typography>

        {/* Mobile title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: "block", sm: "none" } }}
        >
          Warsztat
        </Typography>

        {/* User menu */}
        {user && (
          <Box>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "secondary.main",
                  fontSize: "0.875rem",
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/profile");
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mój profil</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/settings");
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Ustawienia</ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Wyloguj się</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
