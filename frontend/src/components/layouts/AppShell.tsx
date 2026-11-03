import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/authApi";
import { loggedOut } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { useRealtimeConnection } from "@/features/realtime/useRealtimeConnection";
import { useGetMyClinicQuery } from "@/features/clinic/clinicApi";
import { ChangePasswordDialog } from "@/features/auth/ChangePasswordDialog";

export function AppShell() {
  useRealtimeConnection();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const { data: clinic } = useGetMyClinicQuery();

  const baseNavItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/patients", label: "Patients" },
    { to: "/appointments", label: "Appointments" },
    { to: "/calendar", label: "Calendar" },
    { to: "/tasks", label: "Tasks" },
    { to: "/inventory", label: "Inventory" },
  ];

  const navItems =
    user?.role === "ADMIN"
      ? [
          ...baseNavItems,
          { to: "/finance", label: "Finance" },
          { to: "/admin", label: "Admin" },
        ]
      : baseNavItems;

  // days until the subscription/trial ends (null = no end date set)
  const daysLeft = clinic?.paidUntil
    ? Math.ceil((new Date(clinic.paidUntil).getTime() - Date.now()) / 86400000)
    : null;

  const daysText =
    daysLeft === null
      ? ""
      : daysLeft <= 0
        ? "today"
        : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

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
      <aside className="flex w-64 flex-col border-r border-[#E8ECE9] bg-[#F8F9F8] p-4">
        <div className="mb-6 px-2">
          <p className="ff-display text-lg font-medium tracking-tight">
            {clinic?.name ?? "Loading..."}
          </p>
          <p className="mt-1 text-xs text-[#68746D]">
            {user?.firstName} {user?.lastName}
            <span className="ff-mono ml-1 text-[10px] uppercase text-[#8A948E]">
              · {user?.role}
            </span>
          </p>
          {user?.role === "ADMIN" && daysLeft !== null && (
            <p
              className={`mt-1 text-[11px] ${
                daysLeft <= 7 ? "text-amber-700" : "text-[#68746D]"
              }`}
            >
              {clinic?.plan === "TRIAL" ? "Trial" : "Subscription"} ·{" "}
              {daysLeft <= 0
                ? "ends today"
                : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
            </p>
          )}
        </div>
        <div className="mb-4 border-t border-[#E2E7E3]" />
        <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-[#8A948E]">
          Workspace
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-2.5 py-2 transition-colors ${
                  isActive
                    ? "bg-[#E3EBE6] font-medium text-[#1F5D4C]"
                    : "text-[#55645C] hover:bg-[#EDF1EE] hover:text-[#13201C]"
                }`
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-[#E2E7E3] pt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#C8D0CA] bg-white text-[#55645C] hover:text-[#13201C]"
            onClick={handleLogout}
          >
            Log out
          </Button>
          <ChangePasswordDialog />
        </div>
      </aside>

      <main className="flex-1 p-6 xl:p-8">
        {user?.role === "ADMIN" && daysLeft !== null && daysLeft <= 7 && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {clinic?.plan === "TRIAL"
              ? "Your free trial ends"
              : "Your subscription ends"}{" "}
            {daysText}. Contact us to keep access.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
