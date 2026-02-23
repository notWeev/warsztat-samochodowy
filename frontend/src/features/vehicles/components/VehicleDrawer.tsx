import { useCallback } from "react";
import {
  Drawer,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { Vehicle } from "@/shared/types/vehicle.types";
import type { VehicleFormData } from "../schemas/vehicleSchemas";
import { useSnackbar } from "@/shared/hooks/useSnackbar";
import { VehicleForm } from "./VehicleForm";
import { useCreateVehicle, useUpdateVehicle } from "../hooks/useVehicles";

interface VehicleDrawerProps {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  onSuccess?: () => void;
}

export const VehicleDrawer = ({
  open,
  onClose,
  vehicle,
  onSuccess,
}: VehicleDrawerProps) => {
  const isEditing = !!vehicle;
  const { showSnackbar } = useSnackbar();

  // Mutators
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle(vehicle?.id || "");

  const handleSubmit = useCallback(
    async (data: VehicleFormData) => {
      try {
        if (isEditing && vehicle) {
          await updateMutation.mutateAsync(data);
          showSnackbar("Pojazd został zaktualizowany", "success", 3000);
        } else {
          await createMutation.mutateAsync(data);
          showSnackbar("Pojazd został dodany", "success", 3000);
        }

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Błąd przy zapisywaniu";
        showSnackbar(message, "error", 5000);
        console.error("Error submitting vehicle form:", err);
      }
    },
    [
      isEditing,
      vehicle,
      updateMutation,
      createMutation,
      onSuccess,
      onClose,
      showSnackbar,
    ],
  );

  const isLoading = isEditing
    ? updateMutation.isPending
    : createMutation.isPending;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            zIndex: 1299,
          },
        },
      }}
      sx={{
        zIndex: 1300,
      }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500 },
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          zIndex: 1300,
        },
      }}
    >
      <AppBar
        position="sticky"
        sx={{
          top: 0,
          zIndex: 1301,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {isEditing ? "Edytuj pojazd" : "Dodaj nowy pojazd"}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, mt: 5 }}>
        <VehicleForm
          initialData={vehicle}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Box>
    </Drawer>
  );
};
