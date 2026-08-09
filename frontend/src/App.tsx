import { AuthInitializer } from "@/features/auth/AuthInitializer";
import { AppRouter } from "@/routes/AppRouter";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthInitializer>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </AuthInitializer>
  );
}

export default App;
