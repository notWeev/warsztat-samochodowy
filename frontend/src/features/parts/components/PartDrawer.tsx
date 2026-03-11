import { useCallback } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { Part } from "@/shared/types/part.types";
import type { PartFormData } from "../schemas/partSchemas";
import { useSnackbar } from "@/shared/hooks/useSnackbar";
import { PartForm } from "./PartForm";
import { useCreatePart, useUpdatePart } from "../hooks/useParts";

interface PartDrawerProps {
  open: boolean;
  onClose: () => void;
  part?: Part;
  onSuccess?: () => void;
}

export const PartDrawer = ({
  open,
  onClose,
  part,
  onSuccess,
}: PartDrawerProps) => {
  const isEditing = !!part;
  const { showSnackbar } = useSnackbar();

  const createMutation = useCreatePart();
  const updateMutation = useUpdatePart(part?.id ?? "");

  const handleSubmit = useCallback(
    async (data: PartFormData) => {
      try {
        if (isEditing && part) {
          await updateMutation.mutateAsync(data);
          showSnackbar("Część została zaktualizowana", "success", 3000);
        } else {
          await createMutation.mutateAsync(data);
          showSnackbar("Część została dodana", "success", 3000);
        }
        onSuccess?.();
        onClose();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Błąd przy zapisywaniu";
        showSnackbar(message, "error", 5000);
        console.error("Error submitting part form:", err);
      }
    },
    [
      isEditing,
      part,
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
        backdrop: { sx: { zIndex: 1299 } },
        paper: {
          sx: {
            width: { xs: "100%", sm: 520 },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
          },
        },
      }}
      sx={{ zIndex: 1300 }}
    >
      <AppBar position="sticky" sx={{ top: 0, zIndex: 1301 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {isEditing ? "Edytuj część" : "Dodaj nową część"}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="zamknij"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <PartForm
          initialData={part}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Box>
    </Drawer>
  );
};
