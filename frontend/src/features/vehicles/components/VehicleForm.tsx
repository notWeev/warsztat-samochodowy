import { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { Vehicle } from "@/shared/types/vehicle.types";
import type { VehicleFormData } from "../schemas/vehicleSchemas";
import { createVehicleSchema } from "../schemas/vehicleSchemas";
import { useCustomers } from "@/features/customers/hooks/useCustomers";

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading?: boolean;
}

const VehicleFormComponent = ({
  initialData,
  onSubmit,
  isLoading = false,
}: VehicleFormProps) => {
  const isEditing = !!initialData;

  // Pobierz listę klientów do autocomplete
  const { data: customersData } = useCustomers(1, 1000, "", undefined);
  const customers = customersData?.data || [];

  const { control, handleSubmit, formState } = useForm<any>({
    resolver: zodResolver(createVehicleSchema) as any,
    mode: "onBlur",
    defaultValues: {
      customerId: initialData?.customerId || "",
      vin: initialData?.vin || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      year: initialData?.year || new Date().getFullYear(),
      registrationNumber: initialData?.registrationNumber || "",
      fuelType: initialData?.fuelType ?? "",
      engineCapacity: initialData?.engineCapacity ?? "",
      enginePower: initialData?.enginePower ?? "",
      mileage: initialData?.mileage || 0,
      color: initialData?.color || "",
      notes: initialData?.notes || "",
    },
  });

  const { errors } = formState;

  const getErrorMessage = (error: any): string => {
    if (!error) return "";
    if (typeof error.message === "string") return error.message;
    return "";
  };

  const handleFormSubmit = async (data: VehicleFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ p: 0 }}
    >
      {/* Klient - Autocomplete */}
      <Controller
        name="customerId"
        control={control}
        render={({ field }) => (
          <Autocomplete
            {...field}
            disabled={isEditing}
            options={customers}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option;
              return option.type === "INDIVIDUAL"
                ? `${option.firstName} ${option.lastName}`
                : option.companyName || "";
            }}
            filterOptions={(options, state) => {
              const inputValue = state.inputValue.toLowerCase();
              return options.filter((option) => {
                const label =
                  option.type === "INDIVIDUAL"
                    ? `${option.firstName} ${option.lastName}`.toLowerCase()
                    : (option.companyName || "").toLowerCase();
                return label.includes(inputValue);
              });
            }}
            isOptionEqualToValue={(option, value) => {
              if (typeof value === "string") {
                return option.id === value;
              }
              return option.id === value?.id;
            }}
            onChange={(_, value) => {
              field.onChange(value?.id || "");
            }}
            value={customers.find((c) => c.id === field.value) || null}
            fullWidth
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Klient"
                placeholder="Wybierz klienta"
                error={!!errors.customerId}
                helperText={getErrorMessage(errors.customerId)}
                required
              />
            )}
          />
        )}
      />

      {/* Dane techniczne */}
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Dane techniczne
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Controller
          name="vin"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="VIN"
              placeholder="17 znaków (bez I, O, Q)"
              fullWidth
              error={!!errors.vin}
              helperText={getErrorMessage(errors.vin)}
              disabled={isEditing}
              inputProps={{ maxLength: 17 }}
            />
          )}
        />

        <Controller
          name="registrationNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nr rejestracyjny"
              placeholder="np. WN12ABC"
              fullWidth
              error={!!errors.registrationNumber}
              helperText={getErrorMessage(errors.registrationNumber)}
              inputProps={{ maxLength: 15 }}
            />
          )}
        />
      </Stack>

      {/* Marka, model, rok */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Controller
          name="brand"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Marka"
              fullWidth
              error={!!errors.brand}
              helperText={getErrorMessage(errors.brand)}
            />
          )}
        />

        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Model"
              fullWidth
              error={!!errors.model}
              helperText={getErrorMessage(errors.model)}
            />
          )}
        />

        <Controller
          name="year"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Rok produkcji"
              type="number"
              fullWidth
              error={!!errors.year}
              helperText={getErrorMessage(errors.year)}
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            />
          )}
        />
      </Stack>

      {/* Przebieg i kolor */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Controller
          name="mileage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Przebieg (km)"
              type="number"
              fullWidth
              error={!!errors.mileage}
              helperText={getErrorMessage(errors.mileage)}
              inputProps={{ min: 0 }}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Kolor"
              fullWidth
              error={!!errors.color}
              helperText={getErrorMessage(errors.color)}
            />
          )}
        />
      </Stack>

      {/* Silnik */}
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Silnik (opcjonalnie)
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Controller
          name="fuelType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.fuelType}>
              <InputLabel>Typ paliwa</InputLabel>
              <Select
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value as string;
                  field.onChange(value === "" ? undefined : value);
                }}
                onBlur={field.onBlur}
                label="Typ paliwa"
              >
                <MenuItem value="">Brak</MenuItem>
                <MenuItem value="PETROL">Benzyna</MenuItem>
                <MenuItem value="DIESEL">Diesel</MenuItem>
                <MenuItem value="LPG">LPG</MenuItem>
                <MenuItem value="ELECTRIC">Elektryczny</MenuItem>
                <MenuItem value="HYBRID">Hybrydowy</MenuItem>
                <MenuItem value="PLUGIN_HYBRID">Plug-in Hybrid</MenuItem>
              </Select>
              {errors.fuelType && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  {getErrorMessage(errors.fuelType)}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="engineCapacity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Pojemność (cm³)"
              type="number"
              fullWidth
              error={!!errors.engineCapacity}
              helperText={getErrorMessage(errors.engineCapacity)}
              inputProps={{ min: 50, max: 10000 }}
            />
          )}
        />

        <Controller
          name="enginePower"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Moc (KM)"
              type="number"
              fullWidth
              error={!!errors.enginePower}
              helperText={getErrorMessage(errors.enginePower)}
              inputProps={{ min: 1, max: 2000 }}
            />
          )}
        />
      </Stack>

      {/* Notatki */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Notatki"
            fullWidth
            multiline
            rows={3}
            error={!!errors.notes}
            helperText={getErrorMessage(errors.notes)}
            sx={{ mt: 2 }}
          />
        )}
      />

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            "Zaktualizuj"
          ) : (
            "Dodaj pojazd"
          )}
        </Button>
      </Stack>
    </Box>
  );
};

export const VehicleForm = memo(VehicleFormComponent);
