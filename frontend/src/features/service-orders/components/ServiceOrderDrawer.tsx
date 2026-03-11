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
import { useSnackbar } from "@/shared/hooks/useSnackbar";
import { ServiceOrderForm } from "./ServiceOrderForm";
import { useCreateServiceOrder } from "../hooks/useServiceOrders";
import type { CreateServiceOrderFormData } from "../schemas/serviceOrderSchemas";

interface ServiceOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ServiceOrderDrawer = ({
  open,
  onClose,
  onSuccess,
}: ServiceOrderDrawerProps) => {
  const { showSnackbar } = useSnackbar();
  const createMutation = useCreateServiceOrder();

  const handleSubmit = useCallback(
    async (data: CreateServiceOrderFormData) => {
      try {
        await createMutation.mutateAsync({
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          description: data.description,
          priority: data.priority as any,
          assignedMechanicId: data.assignedMechanicId || undefined,
          scheduledAt: data.scheduledAt || undefined,
          mileageAtAcceptance: data.mileageAtAcceptance
            ? Number(data.mileageAtAcceptance)
            : undefined,
          internalNotes: data.internalNotes || undefined,
        });
        showSnackbar("Zlecenie zostało utworzone", "success", 3000);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 400);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Błąd tworzenia zlecenia";
        showSnackbar(msg, "error", 5000);
        console.error("Error creating service order:", err);
      }
    },
    [createMutation, showSnackbar, onSuccess, onClose],
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { zIndex: 1299 } },
        paper: {
          sx: {
            width: { xs: "100%", sm: 560 },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
      sx={{ zIndex: 1300 }}
    >
      <AppBar position="sticky" sx={{ top: 0, zIndex: 1301 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Nowe zlecenie serwisowe
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: "auto", p: 3, mt: 1 }}>
        <ServiceOrderForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </Box>
    </Drawer>
  );
};
