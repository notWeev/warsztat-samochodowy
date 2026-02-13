import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { UserRole } from "../shared/types/auth.types";

const LoginPage = lazy(() =>
  import("../features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("../features/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("../features/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

// Placeholder pages - do zrobienia na później
const DashboardPage = lazy(() =>
  Promise.resolve({ default: () => <div>Dashboard dla pracowników</div> }),
);
const CustomerDashboardPage = lazy(() =>
  Promise.resolve({ default: () => <div>Dashboard dla klientów</div> }),
);
const UnauthorizedPage = lazy(() =>
  Promise.resolve({ default: () => <div>Brak uprawnień</div> }),
);

// Fallback loader
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes - pracownicy i admin */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - klienci */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <CustomerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};
