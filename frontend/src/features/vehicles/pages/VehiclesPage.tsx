import { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import type { Vehicle } from "@/shared/types/vehicle.types";
import { VehicleList } from "../components/VehicleList";
import { VehicleDrawer } from "../components/VehicleDrawer";
import { VehicleDetailsModal } from "../components/VehicleDetailsModal";

export const VehiclesPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsVehicleId, setDetailsVehicleId] = useState<
    string | undefined
  >();

  const handleAddClick = () => {
    setSelectedVehicle(undefined);
    setDrawerOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDrawerOpen(true);
  };

  const handleViewClick = (vehicle: Vehicle) => {
    setDetailsVehicleId(vehicle.id);
    setDetailsModalOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedVehicle(undefined);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setDetailsVehicleId(undefined);
  };

  const handleDetailsEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(false);
    setDrawerOpen(true);
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
        open={drawerOpen}
        onClose={handleDrawerClose}
        vehicle={selectedVehicle}
        onSuccess={() => {
          // Lista się automatycznie odświeży dzięki React Query invalidation
        }}
      />

      {/* Modal ze szczegółami */}
      <VehicleDetailsModal
        open={detailsModalOpen}
        vehicleId={detailsVehicleId}
        onClose={handleDetailsModalClose}
        onEdit={handleDetailsEdit}
      />
    </Container>
  );
};
