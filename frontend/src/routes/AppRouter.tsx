import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { AppShell } from "../components/layouts/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { AppointmentsPage } from "@/pages/AppointmentsPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/patients", element: <PatientsPage /> },
          { path: "/appointments", element: <AppointmentsPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
