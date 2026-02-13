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
} from "@mui/material";
import { Visibility, VisibilityOff, DirectionsCar } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../shared/api/authApi";
import { useAuth } from "../context/AuthContext";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);

      // Przekieruj w zależności od roli
      if (data.user.role === "customer") {
        navigate("/customer/dashboard");
      } else {
        navigate("/dashboard");
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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
              Warsztat Samochodowy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zaloguj się do swojego konta
            </Typography>
          </Box>

          {/* Alert błędu */}
          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Nieprawidłowy email lub hasło"}
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
              disabled={loginMutation.isPending}
            />

            <TextField
              {...register("password")}
              margin="normal"
              fullWidth
              label="Hasło"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loginMutation.isPending}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ textAlign: "right", mb: 2 }}>
              <Link
                component={RouterLink}
                to="/reset-password"
                variant="body2"
                underline="hover"
              >
                Zapomniałeś hasła?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ mt: 2, mb: 3, py: 1.5 }}
            >
              {loginMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Zaloguj się"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Nie masz konta?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  fontWeight={600}
                  underline="hover"
                >
                  Zarejestruj się
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
