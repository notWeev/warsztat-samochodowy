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
import type { Customer } from "@/shared/types/customer.types";
import type { CustomerFormData } from "../schemas/customerSchemas";
import { useSnackbar } from "@/shared/hooks/useSnackbar";
import { CustomerForm } from "./CustomerForm";
import { useCreateCustomer, useUpdateCustomer } from "../hooks/useCustomers";

interface CustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  onSuccess?: () => void;
}

export const CustomerDrawer = ({
  open,
  onClose,
  customer,
  onSuccess,
}: CustomerDrawerProps) => {
  const isEditing = !!customer;
  const { showSnackbar } = useSnackbar();

  // Mutators
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(customer?.id || "");

  const handleSubmit = useCallback(
    async (data: CustomerFormData) => {
      try {
        if (isEditing && customer) {
          await updateMutation.mutateAsync(data);
          showSnackbar("Klient został zaktualizowany", "success", 3000);
        } else {
          await createMutation.mutateAsync(data);
          showSnackbar("Klient został dodany", "success", 3000);
        }

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Błąd przy zapisywaniu";
        showSnackbar(message, "error", 5000);
        console.error("Error submitting customer form:", err);
      }
    },
    [
      isEditing,
      customer,
      updateMutation,
      createMutation,
      onSuccess,
      onClose,
      showSnackbar,
    ],
  );

  // Warunkowe wybieranie stanu ładowania i błędu w zależności od trybu (dodawanie vs edycja)
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
            zIndex: 1299, // Poniżej drawer'a
          },
        },
      }}
      sx={{
        zIndex: 1300, // Wyżej niż TopBar (zazwyczaj 1100)
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
          zIndex: 1301, // Wyżej niż Drawer Paper
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {isEditing ? "Edytuj klienta" : "Dodaj nowego klienta"}
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

      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <CustomerForm
          initialData={customer}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={undefined}
        />
      </Box>
    </Drawer>
  );
};
