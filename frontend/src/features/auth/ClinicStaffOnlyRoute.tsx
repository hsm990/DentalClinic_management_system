import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export function ClinicStaffOnlyRoute() {
  const user = useAppSelector((state) => state.auth.user);
  if (user?.role === "SUPER_ADMIN") {
    return <Navigate to="/super-admin" replace />;
  }
  return <Outlet />;
}
