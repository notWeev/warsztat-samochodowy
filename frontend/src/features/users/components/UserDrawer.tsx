import { memo } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { UserForm } from "./UserForm";
import type { StaffUser } from "@/shared/types/user.types";
import type {
  CreateUserFormData,
  UpdateUserFormData,
} from "../schemas/userSchemas";
import { useState } from "react";

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
  /** undefined = tryb tworzenia; StaffUser = tryb edycji */
  user?: StaffUser;
}

const UserDrawerComponent = ({ open, onClose, user }: UserDrawerProps) => {
  const isEdit = !!user;
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id);

  const mutation = isEdit ? updateUser : createUser;

  const handleSubmit = async (
    data: CreateUserFormData | UpdateUserFormData,
  ) => {
    try {
      if (isEdit) {
        await updateUser.mutateAsync(data as UpdateUserFormData);
        setSnackbar({
          open: true,
          message: "Dane pracownika zostały zaktualizowane",
          severity: "success",
        });
      } else {
        await createUser.mutateAsync(data as CreateUserFormData);
        setSnackbar({
          open: true,
          message: "Pracownik został dodany",
          severity: "success",
        });
      }
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Wystąpił błąd";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 } } } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            pb: 1,
          }}
        >
          <Stack>
            <Typography variant="h6">
              {isEdit
                ? `Edytuj: ${user.firstName} ${user.lastName}`
                : "Nowy pracownik"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit
                ? "Zmień dane lub rolę pracownika"
                : "Dodaj konto pracownika"}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
          <UserForm
            user={user}
            onSubmit={handleSubmit}
            isLoading={mutation.isPending}
            onCancel={onClose}
          />
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export const UserDrawer = memo(UserDrawerComponent);
