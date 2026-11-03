import { useGetLeadsQuery } from "@/features/leads/leadsApi";
import { useListAllClinicsQuery } from "@/features/clinic/clinicApi";
import { StatCard } from "@/features/dashboard/StatCard";
import { LeadsTab } from "@/features/super-admin/LeadsTab";
import { ClinicsTab } from "@/features/super-admin/ClinicsTab";
import { ActivityTab } from "@/features/super-admin/ActivityTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Ban, Inbox, Hourglass } from "lucide-react";
import { getClinicState } from "@/features/super-admin/clinicState";
export function SuperAdminPage() {
  const { data: leads } = useGetLeadsQuery();
  const { data: clinics } = useListAllClinicsQuery();

  const states = (clinics ?? []).map(getClinicState);
  const expired = states.filter((s) => s.key === "expired").length;
  const expiringSoon = states.filter(
    (s) =>
      (s.key === "trial" || s.key === "active") &&
      s.daysLeft !== undefined &&
      s.daysLeft <= 7,
  ).length;
  const newLeads = leads?.filter((l) => l.status === "NEW").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Clinics, demo requests, and your own activity
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total clinics"
          value={clinics?.length ?? "—"}
          icon={Building2}
        />
        <StatCard
          label="Expiring in 7 days"
          value={expiringSoon}
          icon={Hourglass}
          tone={expiringSoon > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Expired"
          value={expired}
          icon={Ban}
          tone={expired > 0 ? "warning" : "success"}
        />
        <StatCard
          label="New leads"
          value={newLeads}
          icon={Inbox}
          tone={newLeads > 0 ? "warning" : "success"}
        />
      </div>

      <Tabs defaultValue="clinics">
        <TabsList>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="clinics" className="pt-4">
          <ClinicsTab />
        </TabsContent>
        <TabsContent value="leads" className="pt-4">
          <LeadsTab />
        </TabsContent>
        <TabsContent value="activity" className="pt-4">
          <ActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
