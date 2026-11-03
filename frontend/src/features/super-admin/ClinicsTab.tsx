import { format } from "date-fns";
import { useListAllClinicsQuery } from "@/features/clinic/clinicApi";
import { OnboardClinicDialog } from "./OnboardClinicDialog";
import { ManageClinicDialog } from "./ManageClinicDialog";
import { SuspendClinicButton } from "./SuspendClinicButton";
import { getClinicState } from "./clinicState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function ClinicsTab() {
  const { data: clinics, isLoading } = useListAllClinicsQuery();
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <OnboardClinicDialog />
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Paid until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No clinics yet.
                </TableCell>
              </TableRow>
            )}
            {clinics?.map((c) => {
              const state = getClinicState(c);
              const expired = state.key === "expired";
              return (
                <TableRow
                  key={c.id}
                  className={!c.isActive ? "opacity-60" : ""}
                >
                  <TableCell>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.admins[0]?.email ?? "No admin"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.plan}</Badge>
                  </TableCell>
                  <TableCell className={expired ? "text-destructive" : ""}>
                    {c.paidUntil
                      ? `${format(new Date(c.paidUntil), "MMM d, yyyy")}${expired ? " (expired)" : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={state.variant}>{state.label}</Badge>
                  </TableCell>
                  <TableCell>{c._count.users}</TableCell>
                  <TableCell>{c._count.patients}</TableCell>
                  <TableCell>
                    {c.lastLoginAt
                      ? format(new Date(c.lastLoginAt), "MMM d, h:mm a")
                      : "Never"}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <ManageClinicDialog clinic={c} />
                    <SuspendClinicButton clinic={c} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
