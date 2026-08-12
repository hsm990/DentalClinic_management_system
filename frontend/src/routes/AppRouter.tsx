import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { AppShell } from "../components/layouts/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { AppointmentsPage } from "@/pages/AppointmentsPage";
import { PatientDetailPage } from "@/pages/PatientDetailPage";
import { AdminPage } from "@/pages/AdminPage";

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
          { path: "/patients/:id", element: <PatientDetailPage /> },
          { path: "/admin", element: <AdminPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
