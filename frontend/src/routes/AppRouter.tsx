import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { AppShell } from "../components/layouts/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          // /patients gets added here in Step 4
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
