import { Box, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Assignment,
  PendingActions,
  Build,
  CheckCircle,
  Cancel,
  EventAvailable,
} from "@mui/icons-material";
import { StatCard } from "../components/StatCard";
import { RecentOrdersTable } from "../components/RecentOrdersTable";
import { useDashboardStats, useRecentOrders } from "../hooks/useDashboard";

export const DashboardPage = () => {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(5);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Dashboard
      </Typography>

      {statsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Nie udało się załadować statystyk. Sprawdź połączenie z serwerem.
        </Alert>
      )}

      {/* Kafelki statystyk */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Wszystkie zlecenia"
            value={stats?.total || 0}
            icon={Assignment}
            color="primary.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Oczekujące"
            value={stats?.pending || 0}
            icon={PendingActions}
            color="info.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="W realizacji"
            value={stats?.inProgress || 0}
            icon={Build}
            color="warning.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Ukończone"
            value={stats?.completed || 0}
            icon={CheckCircle}
            color="success.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Zamknięte"
            value={stats?.closed || 0}
            icon={EventAvailable}
            color="success.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Anulowane"
            value={stats?.cancelled || 0}
            icon={Cancel}
            color="error.main"
            isLoading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* Tabela ostatnich zleceń */}
      <RecentOrdersTable
        orders={recentOrders || []}
        isLoading={ordersLoading}
      />
    </Box>
  );
};
