import { useState } from "react";
import { Alert, Box, Typography, Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  People,
  CheckCircle,
  Block,
  PauseCircle,
  AdminPanelSettings,
  Engineering,
} from "@mui/icons-material";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useUsers } from "../hooks/useUsers";
import { UserList } from "../components/UserList";
import { UserDrawer } from "../components/UserDrawer";
import { UserDetailsModal } from "../components/UserDetailsModal";
import type { StaffUser } from "@/shared/types/user.types";
import { UserRole } from "@/shared/types/auth.types";

export const UsersPage = () => {
  // null = szuflada zamknięta, undefined = tryb tworzenia, StaffUser = tryb edycji
  const [drawerUser, setDrawerUser] = useState<StaffUser | null | undefined>(
    null,
  );
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const handleAddClick = () => setDrawerUser(undefined);
  const handleEditClick = (user: StaffUser) => setDrawerUser(user);
  const handleViewClick = (user: StaffUser) => setDetailsId(user.id);
  const handleDrawerClose = () => setDrawerUser(null);
  const handleDetailsClose = () => setDetailsId(null);
  const handleDetailsEdit = (user: StaffUser) => {
    setDetailsId(null);
    setDrawerUser(user);
  };

  // Stats — fetch all users for counting
  const {
    data: allUsers,
    isLoading: statsLoading,
    error: statsError,
  } = useUsers({ limit: 200 });

  const stats = allUsers?.data
    ? {
        total: allUsers.total,
        active: allUsers.data.filter((u) => u.status === "ACTIVE").length,
        inactive: allUsers.data.filter((u) => u.status === "INACTIVE").length,
        suspended: allUsers.data.filter((u) => u.status === "SUSPENDED").length,
        adminsManagers: allUsers.data.filter(
          (u) => u.role === UserRole.ADMIN || u.role === UserRole.MANAGER,
        ).length,
        mechanics: allUsers.data.filter((u) => u.role === UserRole.MECHANIC)
          .length,
      }
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Pracownicy
        </Typography>
        <Typography color="textSecondary">
          Zarządzaj kontami pracowników i ich uprawnieniami
        </Typography>
      </Box>

      {statsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Nie udało się załadować statystyk
        </Alert>
      )}

      {/* Statystyki */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Wszyscy"
            value={stats?.total ?? 0}
            icon={People}
            color="primary.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Aktywni"
            value={stats?.active ?? 0}
            icon={CheckCircle}
            color="success.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Nieaktywni"
            value={stats?.inactive ?? 0}
            icon={Block}
            color="text.secondary"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Zawieszeni"
            value={stats?.suspended ?? 0}
            icon={PauseCircle}
            color="error.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Admin/Kierownicy"
            value={stats?.adminsManagers ?? 0}
            icon={AdminPanelSettings}
            color="warning.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Mechanicy"
            value={stats?.mechanics ?? 0}
            icon={Engineering}
            color="info.main"
            isLoading={statsLoading}
          />
        </Grid>
      </Grid>

      <UserList
        onAddClick={handleAddClick}
        onEdit={handleEditClick}
        onView={handleViewClick}
      />

      <UserDrawer
        open={drawerUser !== null}
        onClose={handleDrawerClose}
        user={drawerUser ?? undefined}
      />

      <UserDetailsModal
        open={detailsId !== null}
        userId={detailsId ?? undefined}
        onClose={handleDetailsClose}
        onEdit={handleDetailsEdit}
      />
    </Container>
  );
};
