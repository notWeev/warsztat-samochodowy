import { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PartCategory } from "@/shared/types/part.types";
import type { Part } from "@/shared/types/part.types";
import { partSchema } from "../schemas/partSchemas";
import type { PartFormData } from "../schemas/partSchemas";

const CATEGORY_LABELS: Record<PartCategory, string> = {
  ENGINE: "Silnik",
  BRAKES: "Hamulce",
  SUSPENSION: "Zawieszenie",
  ELECTRICAL: "Elektryka",
  TRANSMISSION: "Skrzynia biegów",
  EXHAUST: "Układ wydechowy",
  FILTERS: "Filtry",
  FLUIDS: "Płyny",
  TIRES: "Opony",
  BODYWORK: "Nadwozie",
  INTERIOR: "Wnętrze",
  OTHER: "Inne",
};

interface PartFormProps {
  initialData?: Part;
  onSubmit: (data: PartFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const PartFormComponent = ({
  initialData,
  onSubmit,
  isLoading = false,
  error,
}: PartFormProps) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    mode: "onBlur",
    defaultValues: {
      partNumber: initialData?.partNumber ?? "",
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? PartCategory.OTHER,
      manufacturer: initialData?.manufacturer ?? "",
      brand: initialData?.brand ?? "",
      purchasePrice: initialData?.purchasePrice ?? 0,
      sellingPrice: initialData?.sellingPrice ?? 0,
      quantityInStock: initialData?.quantityInStock ?? 0,
      minStockLevel: initialData?.minStockLevel ?? 5,
      location: initialData?.location ?? "",
      supplier: initialData?.supplier ?? "",
      supplierEmail: initialData?.supplierEmail ?? "",
      supplierPhone: initialData?.supplierPhone ?? "",
      compatibleVehicles: initialData?.compatibleVehicles ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const { errors } = formState;

  const handleFormSubmit = async (data: PartFormData) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
    } catch {
      // błąd obsługiwany w parent
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ p: 2 }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Sekcja: Podstawowe */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Podstawowe informacje
      </Typography>

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="partNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Numer katalogowy *"
                fullWidth
                size="small"
                error={!!errors.partNumber}
                helperText={errors.partNumber?.message}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.category}>
                <InputLabel>Kategoria *</InputLabel>
                <Select {...field} label="Kategoria *">
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Stack>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nazwa części *"
              fullWidth
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Opis"
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          )}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="manufacturer"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Producent" fullWidth size="small" />
            )}
          />
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Marka" fullWidth size="small" />
            )}
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Sekcja: Ceny i magazyn */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Ceny i magazyn
      </Typography>

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="purchasePrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
                label="Cena zakupu *"
                type="number"
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">PLN</InputAdornment>
                  ),
                }}
                error={!!errors.purchasePrice}
                helperText={errors.purchasePrice?.message}
              />
            )}
          />
          <Controller
            name="sellingPrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
                label="Cena sprzedaży *"
                type="number"
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">PLN</InputAdornment>
                  ),
                }}
                error={!!errors.sellingPrice}
                helperText={errors.sellingPrice?.message}
              />
            )}
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="quantityInStock"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                label="Stan magazynowy *"
                type="number"
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">szt.</InputAdornment>
                  ),
                }}
                error={!!errors.quantityInStock}
                helperText={errors.quantityInStock?.message}
              />
            )}
          />
          <Controller
            name="minStockLevel"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                label="Minimalny stan *"
                type="number"
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">szt.</InputAdornment>
                  ),
                }}
                error={!!errors.minStockLevel}
                helperText={errors.minStockLevel?.message}
              />
            )}
          />
        </Stack>

        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Lokalizacja w magazynie"
              fullWidth
              size="small"
              placeholder="np. Regał A, Półka 3"
            />
          )}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Sekcja: Dostawca */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Dostawca
      </Typography>

      <Stack spacing={2}>
        <Controller
          name="supplier"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nazwa dostawcy"
              fullWidth
              size="small"
            />
          )}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="supplierEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email dostawcy"
                fullWidth
                size="small"
                error={!!errors.supplierEmail}
                helperText={errors.supplierEmail?.message}
              />
            )}
          />
          <Controller
            name="supplierPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Telefon dostawcy"
                fullWidth
                size="small"
              />
            )}
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Sekcja: Dodatkowe */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Dodatkowe
      </Typography>

      <Stack spacing={2}>
        <Controller
          name="compatibleVehicles"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Kompatybilne pojazdy"
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="np. VW Golf IV 1.9 TDI 2001-2004, Skoda Octavia I"
            />
          )}
        />
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Uwagi"
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          )}
        />
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {isLoading
            ? "Zapisywanie..."
            : isEditing
              ? "Zapisz zmiany"
              : "Dodaj część"}
        </Button>
      </Box>
    </Box>
  );
};

export const PartForm = memo(PartFormComponent);
