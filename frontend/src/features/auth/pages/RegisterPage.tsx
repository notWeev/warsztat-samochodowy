import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff, DirectionsCar } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../shared/api/authApi";
import { useAuth } from "../context/AuthContext";
import { registerSchema, type RegisterFormData } from "../schemas/authSchemas";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      navigate("/customer/dashboard");
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // Usuń confirmPassword przed wysłaniem
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #fafafaff 0%, #aabbdaf3 100%)",
        py: 3,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
          }}
        >
          {/* Logo i tytuł */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <DirectionsCar
              sx={{
                fontSize: 60,
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight={600}
            >
              Rejestracja konta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utwórz konto klienta w systemie warsztatu
            </Typography>
          </Box>

          {/* Alert błędu */}
          {registerMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : "Wystąpił błąd podczas rejestracji"}
            </Alert>
          )}

          {/* Formularz */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("firstName")}
                  fullWidth
                  label="Imię"
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={registerMutation.isPending}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("lastName")}
                  fullWidth
                  label="Nazwisko"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={registerMutation.isPending}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  {...register("email")}
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={registerMutation.isPending}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  {...register("phone")}
                  fullWidth
                  label="Numer telefonu (opcjonalnie)"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+48 123 456 789"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  disabled={registerMutation.isPending}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  {...register("password")}
                  fullWidth
                  label="Hasło"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={registerMutation.isPending}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  {...register("confirmPassword")}
                  fullWidth
                  label="Potwierdź hasło"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={registerMutation.isPending}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {registerMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Zarejestruj się"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Masz już konto?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  fontWeight={600}
                  underline="hover"
                >
                  Zaloguj się
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
