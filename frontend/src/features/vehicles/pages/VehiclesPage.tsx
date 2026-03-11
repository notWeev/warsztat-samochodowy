import { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import type { Vehicle } from "@/shared/types/vehicle.types";
import { VehicleList } from "../components/VehicleList";
import { VehicleDrawer } from "../components/VehicleDrawer";
import { VehicleDetailsModal } from "../components/VehicleDetailsModal";

export const VehiclesPage = () => {
  // null = szuflada zamknięta, undefined = tryb tworzenia, Vehicle = tryb edycji
  const [drawerVehicle, setDrawerVehicle] = useState<
    Vehicle | null | undefined
  >(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const handleAddClick = () => setDrawerVehicle(undefined);
  const handleEditClick = (vehicle: Vehicle) => setDrawerVehicle(vehicle);
  const handleViewClick = (vehicle: Vehicle) => setDetailsId(vehicle.id);
  const handleDrawerClose = () => setDrawerVehicle(null);
  const handleDetailsClose = () => setDetailsId(null);
  const handleDetailsEdit = (vehicle: Vehicle) => {
    setDetailsId(null);
    setDrawerVehicle(vehicle);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Zarządzanie Pojazdami
        </Typography>
        <Typography color="textSecondary">
          Dodaj, edytuj i zarządzaj pojazdami w Twoim warsztacie
        </Typography>
      </Box>

      <VehicleList
        onAddClick={handleAddClick}
        onEdit={handleEditClick}
        onView={handleViewClick}
      />

      {/* Drawer do dodawania/edycji */}
      <VehicleDrawer
        open={drawerVehicle !== null}
        onClose={handleDrawerClose}
        vehicle={drawerVehicle ?? undefined}
        onSuccess={() => {}}
      />

      {/* Modal ze szczegółami */}
      <VehicleDetailsModal
        open={detailsId !== null}
        vehicleId={detailsId ?? undefined}
        onClose={handleDetailsClose}
        onEdit={handleDetailsEdit}
      />
    </Container>
  );
};
