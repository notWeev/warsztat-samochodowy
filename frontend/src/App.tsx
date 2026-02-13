import { AuthProvider } from "./features/auth/context/AuthContext";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
