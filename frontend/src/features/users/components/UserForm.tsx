import { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { StaffUser } from "@/shared/types/user.types";
import { USER_ROLE_LABELS } from "@/shared/types/user.types";
import { UserRole } from "@/shared/types/auth.types";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "../schemas/userSchemas";

interface BaseFormProps {
  isLoading?: boolean;
  onCancel: () => void;
}

interface CreateFormProps extends BaseFormProps {
  onSubmit: (data: CreateUserFormData) => void;
}

interface EditFormProps extends BaseFormProps {
  user: StaffUser;
  onSubmit: (data: UpdateUserFormData) => void;
}

interface UserFormProps {
  user?: StaffUser;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const ROLES = Object.values(UserRole) as Array<keyof typeof USER_ROLE_LABELS>;
const STATUSES = [
  { value: "ACTIVE", label: "Aktywny" },
  { value: "INACTIVE", label: "Nieaktywny" },
  { value: "SUSPENDED", label: "Zawieszony" },
];

// --- Formularz tworzenia ---
const CreateForm = ({ onSubmit, isLoading, onCancel }: CreateFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: UserRole.RECEPTION,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Dane osobowe
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Imię"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nazwisko"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Telefon"
                    fullWidth
                    size="small"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Konto
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Adres email"
                    type="email"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hasło"
                    type="password"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.password}
                    helperText={
                      errors.password?.message ??
                      "Min. 8 znaków, wielka litera, cyfra, znak specjalny"
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.role}>
                    <InputLabel required>Rola</InputLabel>
                    <Select {...field} label="Rola">
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                          {USER_ROLE_LABELS[r]}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && (
                      <FormHelperText>{errors.role.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" loading={isLoading}>
            Dodaj pracownika
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// --- Formularz edycji ---
const EditForm = ({ user, onSubmit, isLoading, onCancel }: EditFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Dane osobowe
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Imię"
                    fullWidth
                    size="small"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nazwisko"
                    fullWidth
                    size="small"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Telefon"
                    fullWidth
                    size="small"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Konto
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.role}>
                    <InputLabel>Rola</InputLabel>
                    <Select {...field} label="Rola">
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                          {USER_ROLE_LABELS[r]}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && (
                      <FormHelperText>{errors.role.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {STATUSES.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="emailVerified"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Email zweryfikowany"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" loading={isLoading}>
            Zapisz zmiany
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// --- Eksportowany komponent ---
const UserFormComponent = ({
  user,
  onSubmit,
  isLoading,
  onCancel,
}: UserFormProps) => {
  if (user) {
    return (
      <EditForm
        user={user}
        onSubmit={onSubmit as (data: UpdateUserFormData) => void}
        isLoading={isLoading}
        onCancel={onCancel}
      />
    );
  }
  return (
    <CreateForm
      onSubmit={onSubmit as (data: CreateUserFormData) => void}
      isLoading={isLoading}
      onCancel={onCancel}
    />
  );
};

export const UserForm = memo(UserFormComponent);
