import { useState } from "react";
import { Alert, Box, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Inventory,
  CheckCircle,
  Warning,
  Cancel,
  DoDisturb,
  AttachMoney,
} from "@mui/icons-material";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { usePartsStats } from "../hooks/useParts";
import { PartList } from "../components/PartList";
import { PartDrawer } from "../components/PartDrawer";
import { PartDetailsModal } from "../components/PartDetailsModal";
import type { Part } from "@/shared/types/part.types";

export const PartsPage = () => {
  // null = szuflada zamknięta, undefined = tryb tworzenia, Part = tryb edycji
  const [drawerPart, setDrawerPart] = useState<Part | null | undefined>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = usePartsStats();

  const handleAddClick = () => setDrawerPart(undefined);
  const handleEditClick = (part: Part) => setDrawerPart(part);
  const handleViewClick = (part: Part) => setDetailsId(part.id);
  const handleDrawerClose = () => setDrawerPart(null);
  const handleDetailsModalClose = () => setDetailsId(null);
  const handleDetailsEdit = (part: Part) => {
    setDetailsId(null);
    setDrawerPart(part);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Magazyn Części
        </Typography>
        <Typography color="textSecondary">
          Zarządzaj częściami zamiennymi i stanem magazynowym
        </Typography>
      </Box>

      {statsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Nie udało się załadować statystyk magazynu
        </Alert>
      )}

      {/* Statystyki */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Wszystkich"
            value={stats?.total ?? 0}
            icon={Inventory}
            color="primary.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Dostępnych"
            value={stats?.available ?? 0}
            icon={CheckCircle}
            color="success.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Niski stan"
            value={stats?.lowStock ?? 0}
            icon={Warning}
            color="warning.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Brak w magazynie"
            value={stats?.outOfStock ?? 0}
            icon={Cancel}
            color="error.main"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Wycofanych"
            value={stats?.discontinued ?? 0}
            icon={DoDisturb}
            color="text.secondary"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            title="Wart. magazynu"
            value={
              stats
                ? `${Number(stats.totalValue).toLocaleString("pl-PL", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} PLN`
                : 0
            }
            icon={AttachMoney}
            color="info.main"
            isLoading={statsLoading}
          />
        </Grid>
      </Grid>

      <PartList
        onAddClick={handleAddClick}
        onEdit={handleEditClick}
        onView={handleViewClick}
      />

      <PartDrawer
        open={drawerPart !== null}
        onClose={handleDrawerClose}
        part={drawerPart ?? undefined}
      />

      <PartDetailsModal
        open={detailsId !== null}
        partId={detailsId ?? undefined}
        onClose={handleDetailsModalClose}
        onEdit={handleDetailsEdit}
      />
    </Container>
  );
};
