import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export function PublicOnlyRoute() {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return (
      <Navigate
        to={user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}
