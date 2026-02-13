import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { MainLayout } from "../layout/MainLayout";
import { CustomerLayout } from "../layout/CustomerLayout";
import { UserRole } from "../shared/types/auth.types";

// Lazy imports dla optymalizacji
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

// Placeholder pages na później
const DashboardPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Dashboard dla pracowników</h1>
        <p>Witaj w systemie zarządzania warsztatem!</p>
      </Box>
    ),
  }),
);

const OrdersPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Zlecenia</h1>
        <p>Lista zleceń napraw</p>
      </Box>
    ),
  }),
);

const CustomersPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Klienci</h1>
        <p>Zarządzanie klientami</p>
      </Box>
    ),
  }),
);

const VehiclesPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Pojazdy</h1>
        <p>Baza pojazdów</p>
      </Box>
    ),
  }),
);

const PartsPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Części</h1>
        <p>Magazyn części zamiennych</p>
      </Box>
    ),
  }),
);

const SettingsPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Ustawienia</h1>
        <p>Konfiguracja systemu</p>
      </Box>
    ),
  }),
);

const ProfilePage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Mój profil</h1>
        <p>Zarządzanie kontem użytkownika</p>
      </Box>
    ),
  }),
);

// Customer pages
const CustomerDashboardPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Panel klienta</h1>
        <p>Witaj w panelu klienta warsztatu!</p>
      </Box>
    ),
  }),
);

const CustomerVehiclesPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Moje pojazdy</h1>
        <p>Lista Twoich pojazdów</p>
      </Box>
    ),
  }),
);

const CustomerOrdersPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Moje zlecenia</h1>
        <p>Historia napraw</p>
      </Box>
    ),
  }),
);

const CustomerProfilePage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box>
        <h1>Mój profil</h1>
        <p>Dane kontaktowe i ustawienia konta</p>
      </Box>
    ),
  }),
);

const UnauthorizedPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <h1>403 - Brak dostępu</h1>
        <p>Nie masz uprawnień do tej strony</p>
      </Box>
    ),
  }),
);

const NotFoundPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <h1>404 - Nie znaleziono</h1>
        <p>Strona nie istnieje</p>
      </Box>
    ),
  }),
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

        {/* Protected routes - ADMIN/EMPLOYEE z MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="parts" element={<PartsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Protected routes - CUSTOMER z CustomerLayout */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/customer/dashboard" replace />}
          />
          <Route path="dashboard" element={<CustomerDashboardPage />} />
          <Route path="vehicles" element={<CustomerVehiclesPage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
