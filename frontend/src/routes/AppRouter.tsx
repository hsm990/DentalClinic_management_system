import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { AppShell } from "../components/layouts/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { AppointmentsPage } from "@/pages/AppointmentsPage";
import { PatientDetailPage } from "@/pages/PatientDetailPage";
import { AdminPage } from "@/pages/AdminPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { TasksPage } from "@/pages/TasksPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { FinancePage } from "@/pages/FinancePage";
const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
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
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/tasks", element: <TasksPage /> },
          { path: "/inventory", element: <InventoryPage /> },
          { path: "/finance", element: <FinancePage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
