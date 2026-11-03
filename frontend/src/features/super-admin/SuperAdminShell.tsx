import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useLogoutMutation } from "@/features/auth/authApi";
import { loggedOut } from "@/features/auth/authSlice";
import { ChangePasswordDialog } from "@/features/auth/ChangePasswordDialog";
import { Button } from "@/components/ui/button";

export function SuperAdminShell() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  // hooks above, guard below (the rules-of-hooks order)
  if (user?.role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;

  async function handleLogout() {
    try {
      await logout().unwrap();
    } finally {
      dispatch(loggedOut());
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div>
            <p className="font-semibold">HSL Clinic</p>
            <p className="text-xs text-muted-foreground">Platform admin</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-sm text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
            <ChangePasswordDialog />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
