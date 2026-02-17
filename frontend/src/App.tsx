import { AuthProvider } from "./features/auth/context/AuthContext";
import { SnackbarProvider } from "./shared/context/SnackbarContext";
import { SnackbarDisplay } from "./shared/components/SnackbarDisplay";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AppRouter />
        <SnackbarDisplay />
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
