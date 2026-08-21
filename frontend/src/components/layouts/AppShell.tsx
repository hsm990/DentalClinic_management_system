import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/authApi";
import { loggedOut } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRealtimeConnection } from "@/features/realtime/useRealtimeConnection";

export function AppShell() {
  useRealtimeConnection();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const baseNavItems = [
    { to: "/", label: "Dashboard" },
    { to: "/patients", label: "Patients" },
    { to: "/appointments", label: "Appointments" },
    { to: "/calendar", label: "Calendar" },
  ]; // Admin removed from here — added conditionally below

  const navItems =
    user?.role === "ADMIN"
      ? [...baseNavItems, { to: "/admin", label: "Admin" }]
      : baseNavItems;

  async function handleLogout() {
    try {
      await logout().unwrap();
    } finally {
      dispatch(loggedOut());
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/20 p-4">
        <div className="mb-6">
          <p className="font-semibold">HSL Dental Clinic</p>
          <p className="text-sm text-muted-foreground">
            {user?.firstName} {user?.lastName} · {user?.role}
          </p>
        </div>
        <Separator className="mb-4" />
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 w-full"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
