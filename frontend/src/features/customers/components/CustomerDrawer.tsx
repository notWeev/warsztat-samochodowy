import { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { Customer } from "@/shared/types/customer.types";
import type { CustomerFormData } from "../schemas/customerSchemas";
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
  const [successMessage, setSuccessMessage] = useState("");

  // Mutators
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(customer?.id || "");

  // Restartuje success message przy każdym otwarciu drawer
  useEffect(() => {
    if (open) {
      setSuccessMessage("");
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (data: CustomerFormData) => {
      try {
        if (isEditing && customer) {
          await updateMutation.mutateAsync(data);
          setSuccessMessage("Klient został zaktualizowany");
        } else {
          await createMutation.mutateAsync(data);
          setSuccessMessage("Klient został dodany");
        }

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } catch (err) {
        console.error("Error submitting customer form:", err);
      }
    },
    [isEditing, customer, updateMutation, createMutation, onSuccess, onClose]
  );

  // Warunkowe wybieranie stanu ładowania i błędu w zależności od trybu (dodawanie vs edycja)
  const isLoading = isEditing
    ? updateMutation.isPending
    : createMutation.isPending;
  const error = isEditing ? updateMutation.error : createMutation.error;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ width: { xs: "100%", sm: 450 }, maxWidth: "100%" }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {isEditing ? "Edytuj klienta" : "Dodaj nowego klienta"}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <CustomerForm
          initialData={customer}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error?.message}
        />
      </Box>
    </Drawer>
  );
};
