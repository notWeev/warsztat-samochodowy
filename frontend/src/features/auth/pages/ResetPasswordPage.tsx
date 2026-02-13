import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import { DirectionsCar, CheckCircle } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../shared/api/authApi";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/authSchemas";

export const ResetPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setEmailSent(true);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetMutation.mutate(data);
  };

  if (emailSent) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 80,
                color: "success.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Email został wysłany!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Sprawdź swoją skrzynkę email i kliknij w link resetujący hasło.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
            >
              Powrót do logowania
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

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
      <Container maxWidth="sm">
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
              Resetowanie hasła
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Podaj email powiązany z Twoim kontem
            </Typography>
          </Box>

          {/* Alert błędu */}
          {resetMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {resetMutation.error instanceof Error
                ? resetMutation.error.message
                : "Wystąpił błąd podczas wysyłania emaila"}
            </Alert>
          )}

          {/* Formularz */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register("email")}
              margin="normal"
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={resetMutation.isPending}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={resetMutation.isPending}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {resetMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Wyślij link resetujący"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                underline="hover"
              >
                Powrót do logowania
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
