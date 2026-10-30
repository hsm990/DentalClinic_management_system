import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/try", label: "Dashboard" },
  { to: "/try/patients", label: "Patients" },
  { to: "/try/appointments", label: "Appointments" },
];

export function DemoAppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/20 p-4">
        <div className="mb-2 rounded-md bg-[#D9A441]/15 px-2 py-1 text-center text-xs font-medium text-[#8A6418]">
          Demo mode — nothing is saved
        </div>
        <div className="mb-6 mt-4">
          <p className="font-semibold">HSL Clinic</p>
          <p className="text-sm text-muted-foreground">Trying it out</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/">
          <Button variant="outline" size="sm" className="mt-6 w-full">
            Exit demo
          </Button>
        </Link>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
