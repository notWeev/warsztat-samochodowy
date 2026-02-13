import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <TopBar onMenuClick={handleDrawerToggle} />

      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Sidebar open={true} onClose={() => {}} variant="permanent" />
      </Box>

      {/* Mobile Drawer */}
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
      />

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
      <BottomNav />
    </Box>
  );
};
