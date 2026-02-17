import { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import type { Customer } from "@/shared/types/customer.types";
import type { CustomerFormData } from "../schemas/customerSchemas";
import { customerSchema } from "../schemas/customerSchemas";

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const CustomerFormComponent = ({
  initialData,
  onSubmit,
  isLoading = false,
  error,
}: CustomerFormProps) => {
  const isEditing = !!initialData;
  const defaultType = initialData?.type || "INDIVIDUAL";

  // Dynamiczny resolver w zależności od typu
  const { control, handleSubmit, watch, reset, formState } =
    useForm<CustomerFormData>({
      resolver: zodResolver(customerSchema),
      mode: "onBlur",
      defaultValues: {
        type: defaultType as "INDIVIDUAL" | "BUSINESS",
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        street: initialData?.street || "",
        postalCode: initialData?.postalCode || "",
        city: initialData?.city || "",
        notes: initialData?.notes || "",
        pesel:
          initialData?.type === "INDIVIDUAL"
            ? (initialData as any).pesel || ""
            : "",
        nip:
          initialData?.type === "BUSINESS"
            ? (initialData as any).nip || ""
            : "",
        companyName:
          initialData?.type === "BUSINESS"
            ? (initialData as any).companyName || ""
            : "",
      },
    });

  const customerType = watch("type");
  const { errors } = formState;

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
    } catch (err) {
      // Error obsługiwany w parent komponencie
      console.error("Form submission error:", err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ p: 2 }}
    >
      {error && <Alert severity="error">{error}</Alert>}

      {/* Typ klienta */}
      <FormControl fullWidth margin="normal">
        <FormLabel>Typ klienta</FormLabel>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel
                value="INDIVIDUAL"
                control={<Radio />}
                label="Osoba prywatna"
                disabled={isEditing}
              />
              <FormControlLabel
                value="BUSINESS"
                control={<Radio />}
                label="Firma"
                disabled={isEditing}
              />
            </RadioGroup>
          )}
        />
      </FormControl>

      {/* Wspólne pola dla obu typów */}
      {customerType === "INDIVIDUAL" && (
        <>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Imię"
                fullWidth
                margin="normal"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nazwisko"
                fullWidth
                margin="normal"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />

          <Controller
            name="pesel"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="PESEL"
                fullWidth
                margin="normal"
                placeholder="11 cyfr"
                error={!!(errors as any).pesel}
                helperText={(errors as any).pesel?.message}
                disabled={isEditing}
              />
            )}
          />
        </>
      )}

      {customerType === "BUSINESS" && (
        <>
          <Controller
            name="companyName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nazwa firmy"
                fullWidth
                margin="normal"
                error={!!(errors as any).companyName}
                helperText={(errors as any).companyName?.message}
              />
            )}
          />

          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Imię (osoba kontaktowa)"
                fullWidth
                margin="normal"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nazwisko (osoba kontaktowa)"
                fullWidth
                margin="normal"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />

          <Controller
            name="nip"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="NIP"
                fullWidth
                margin="normal"
                placeholder="10 cyfr"
                error={!!(errors as any).nip}
                helperText={(errors as any).nip?.message}
                disabled={isEditing}
              />
            )}
          />
        </>
      )}

      {/* Wspólne pola */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Telefon"
            fullWidth
            margin="normal"
            placeholder="+48 XXX XXX XXX"
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        )}
      />

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Adres
      </Typography>

      <Controller
        name="street"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Ulica"
            fullWidth
            margin="normal"
            error={!!errors.street}
            helperText={errors.street?.message}
          />
        )}
      />

      <Controller
        name="postalCode"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Kod pocztowy"
            fullWidth
            margin="normal"
            placeholder="XX-XXX"
            error={!!errors.postalCode}
            helperText={errors.postalCode?.message}
          />
        )}
      />

      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Miasto"
            fullWidth
            margin="normal"
            error={!!errors.city}
            helperText={errors.city?.message}
          />
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Notatki"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!errors.notes}
            helperText={errors.notes?.message}
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
            "Dodaj klienta"
          )}
        </Button>
      </Stack>
    </Box>
  );
};

export const CustomerForm = memo(CustomerFormComponent);
