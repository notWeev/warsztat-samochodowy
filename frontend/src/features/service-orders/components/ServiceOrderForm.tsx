import { useState, memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Step,
  Stepper,
  StepLabel,
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { ArrowBack, ArrowForward, Check } from "@mui/icons-material";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useVehiclesByCustomer } from "@/features/vehicles/hooks/useVehicles";
import { useMechanics } from "../hooks/useServiceOrders";
import { createServiceOrderSchema } from "../schemas/serviceOrderSchemas";
import type { CreateServiceOrderFormData } from "../schemas/serviceOrderSchemas";
import type { Customer } from "@/shared/types/customer.types";

const STEPS = ["Klient i pojazd", "Opis zlecenia", "Przypisanie mechanika"];

interface ServiceOrderFormProps {
  onSubmit: (data: CreateServiceOrderFormData) => Promise<void>;
  isLoading?: boolean;
}

const getCustomerLabel = (c: Customer) =>
  c.type === "INDIVIDUAL"
    ? `${c.firstName} ${c.lastName}`
    : c.companyName || "";

const ServiceOrderFormComponent = ({
  onSubmit,
  isLoading = false,
}: ServiceOrderFormProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const { data: customersData } = useCustomers(1, 500, "", undefined);
  const customers = customersData?.data || [];

  const { data: mechanics = [] } = useMechanics();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateServiceOrderFormData>({
    resolver: zodResolver(createServiceOrderSchema) as any,
    mode: "onBlur",
    defaultValues: {
      customerId: "",
      vehicleId: "",
      description: "",
      priority: "NORMAL",
      scheduledAt: "",
      mileageAtAcceptance: "" as any,
      internalNotes: "",
      assignedMechanicId: "",
    },
  });

  const watchedCustomerId = watch("customerId");
  const { data: vehicles = [] } = useVehiclesByCustomer(
    watchedCustomerId || "",
  );

  const getError = (err: any) =>
    typeof err?.message === "string" ? err.message : "";

  const handleNext = async () => {
    let valid = false;
    if (activeStep === 0) {
      valid = await trigger(["customerId", "vehicleId"]);
    } else if (activeStep === 1) {
      valid = await trigger([
        "description",
        "priority",
        "scheduledAt",
        "mileageAtAcceptance",
      ]);
    } else {
      valid = true;
    }
    if (valid) setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleFormSubmit = async (data: CreateServiceOrderFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ── STEP 1: Customer & Vehicle ── */}
      {activeStep === 0 && (
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Wybierz klienta i pojazd, dla którego tworzone jest zlecenie
          </Typography>

          {/* Customer autocomplete */}
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={customers}
                getOptionLabel={getCustomerLabel}
                isOptionEqualToValue={(o, v) =>
                  typeof v === "string" ? o.id === v : o.id === v?.id
                }
                onChange={(_, value) => field.onChange(value?.id || "")}
                value={customers.find((c) => c.id === field.value) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Klient"
                    placeholder="Wyszukaj klienta"
                    error={!!errors.customerId}
                    helperText={getError(errors.customerId)}
                    required
                  />
                )}
              />
            )}
          />

          {/* Vehicle autocomplete - depends on selected customer */}
          <Controller
            name="vehicleId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={vehicles}
                disabled={!watchedCustomerId}
                getOptionLabel={(v) =>
                  `${v.brand} ${v.model} ${v.year}${v.registrationNumber ? ` — ${v.registrationNumber}` : ""}`
                }
                isOptionEqualToValue={(o, v) =>
                  typeof v === "string" ? o.id === v : o.id === v?.id
                }
                onChange={(_, value) => field.onChange(value?.id || "")}
                value={vehicles.find((v) => v.id === field.value) || null}
                noOptionsText={
                  watchedCustomerId
                    ? "Brak pojazdów dla tego klienta"
                    : "Najpierw wybierz klienta"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pojazd"
                    placeholder="Wybierz pojazd"
                    error={!!errors.vehicleId}
                    helperText={getError(errors.vehicleId)}
                    required
                  />
                )}
              />
            )}
          />
        </Stack>
      )}

      {/* ── STEP 2: Description & Details ── */}
      {activeStep === 1 && (
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Opisz usterkę i ustaw szczegóły zlecenia
          </Typography>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Opis usterki / zakres prac"
                multiline
                rows={5}
                fullWidth
                required
                error={!!errors.description}
                helperText={
                  getError(errors.description) ||
                  "Minimum 10 znaków — opisz usterkę i planowany zakres prac"
                }
              />
            )}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.priority}>
                  <InputLabel>Priorytet</InputLabel>
                  <Select {...field} label="Priorytet">
                    <MenuItem value="LOW">Niski</MenuItem>
                    <MenuItem value="NORMAL">Normalny</MenuItem>
                    <MenuItem value="HIGH">Wysoki</MenuItem>
                    <MenuItem value="URGENT">Pilny</MenuItem>
                  </Select>
                  {errors.priority && (
                    <FormHelperText>{getError(errors.priority)}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Planowana data"
                  type="datetime-local"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.scheduledAt}
                  helperText={getError(errors.scheduledAt)}
                />
              )}
            />
          </Stack>

          <Controller
            name="mileageAtAcceptance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Przebieg przy przyjęciu (km)"
                type="number"
                fullWidth
                error={!!errors.mileageAtAcceptance}
                helperText={getError(errors.mileageAtAcceptance)}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            )}
          />

          <Controller
            name="internalNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notatki wewnętrzne (opcjonalnie)"
                multiline
                rows={2}
                fullWidth
                error={!!errors.internalNotes}
                helperText={getError(errors.internalNotes)}
              />
            )}
          />
        </Stack>
      )}

      {/* ── STEP 3: Mechanic Assignment ── */}
      {activeStep === 2 && (
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Opcjonalnie przypisz mechanika do tego zlecenia
          </Typography>

          <Controller
            name="assignedMechanicId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={mechanics}
                getOptionLabel={(m) => `${m.firstName} ${m.lastName}`}
                isOptionEqualToValue={(o, v) =>
                  typeof v === "string" ? o.id === v : o.id === v?.id
                }
                onChange={(_, value) => field.onChange(value?.id || "")}
                value={mechanics.find((m) => m.id === field.value) || null}
                noOptionsText="Brak mechaników"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Mechanik (opcjonalnie)"
                    placeholder="Wybierz mechanika"
                    error={!!errors.assignedMechanicId}
                    helperText={getError(errors.assignedMechanicId)}
                  />
                )}
              />
            )}
          />
        </Stack>
      )}

      {/* Navigation */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Wstecz
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNext}
          >
            Dalej
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="success"
            startIcon={isLoading ? <CircularProgress size={18} /> : <Check />}
            disabled={isLoading}
          >
            Utwórz zlecenie
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export const ServiceOrderForm = memo(ServiceOrderFormComponent);
