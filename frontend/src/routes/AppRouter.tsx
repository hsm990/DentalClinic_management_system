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
import { AuditLogPage } from "@/pages/AuditLogPage";
import { LandingPage } from "@/pages/LandingPage";
import { RequestDemoPage } from "@/pages/RequestDemoPage";
import { SuperAdminPage } from "@/pages/SuperAdminPage";
import { ClinicStaffOnlyRoute } from "@/features/auth/ClinicStaffOnlyRoute";
import { DemoDataProvider } from "@/demo/DemoDataContext";
import { DemoAppShell } from "@/demo/DemoAppShell";
import { DemoDashboardPage } from "@/demo/pages/DemoDashboardPage";
import { DemoPatientsPage } from "@/demo/pages/DemoPatientsPage";
import { DemoPatientDetailPage } from "@/demo/pages/DemoPatientDetailPage";
import { DemoAppointmentsPage } from "@/demo/pages/DemoAppointmentsPage";
import { DemoCalendarPage } from "@/demo/pages/DemoCalendarPage";
import { DemoTasksPage } from "@/demo/pages/DemoTasksPage";
import { DemoInventoryPage } from "@/demo/pages/DemoInventoryPage";
import { DemoFinancePage } from "@/demo/pages/DemoFinancePage";
import { SuperAdminShell } from "@/features/super-admin/SuperAdminShell";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/request-demo", element: <RequestDemoPage /> },
  {
    path: "/try",
    element: (
      <DemoDataProvider>
        <DemoAppShell />
      </DemoDataProvider>
    ),
    children: [
      { index: true, element: <DemoDashboardPage /> },
      { path: "patients", element: <DemoPatientsPage /> },
      { path: "patients/:id", element: <DemoPatientDetailPage /> },
      { path: "appointments", element: <DemoAppointmentsPage /> },
      { path: "calendar", element: <DemoCalendarPage /> },
      { path: "tasks", element: <DemoTasksPage /> },
      { path: "inventory", element: <DemoInventoryPage /> },
      { path: "finance", element: <DemoFinancePage /> },
    ],
  },
  {
    element: <PublicOnlyRoute />,

    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SuperAdminShell />,
        children: [{ path: "/super-admin", element: <SuperAdminPage /> }],
      },

      {
        element: <ClinicStaffOnlyRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/patients", element: <PatientsPage /> },
              { path: "/appointments", element: <AppointmentsPage /> },
              { path: "/patients/:id", element: <PatientDetailPage /> },
              { path: "/admin", element: <AdminPage /> },
              { path: "/calendar", element: <CalendarPage /> },
              { path: "/tasks", element: <TasksPage /> },
              { path: "/inventory", element: <InventoryPage /> },
              { path: "/finance", element: <FinancePage /> },
              { path: "/audit-log", element: <AuditLogPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
