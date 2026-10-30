import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { useGetLeadsQuery } from "@/features/leads/leadsApi";
import { useListAllClinicsQuery } from "@/features/clinic/clinicApi";
import { StatCard } from "@/features/dashboard/StatCard";
import { LeadsTab } from "@/features/super-admin/LeadsTab";
import { ClinicsTab } from "@/features/super-admin/ClinicsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Mail, Inbox } from "lucide-react";

export function SuperAdminPage() {
  const user = useAppSelector((state) => state.auth.user);

  const { data: leads } = useGetLeadsQuery();
  const { data: clinics } = useListAllClinicsQuery();
  if (user?.role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;

  const newLeadsCount = leads?.filter((l) => l.status === "NEW").length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Clinics and incoming demo requests
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total clinics"
          value={clinics?.length ?? "—"}
          icon={Building2}
        />
        <StatCard
          label="Total leads"
          value={leads?.length ?? "—"}
          icon={Mail}
        />
        <StatCard
          label="New leads"
          value={newLeadsCount}
          icon={Inbox}
          tone={newLeadsCount > 0 ? "warning" : "success"}
        />
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="pt-4">
          <LeadsTab />
        </TabsContent>
        <TabsContent value="clinics" className="pt-4">
          <ClinicsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
