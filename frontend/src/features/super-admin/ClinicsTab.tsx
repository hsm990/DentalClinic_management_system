import { format } from "date-fns";
import { useListAllClinicsQuery } from "@/features/clinic/clinicApi";
import { OnboardClinicDialog } from "./OnboardClinicDialog";
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Onboarded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No clinics yet.
                </TableCell>
              </TableRow>
            )}
            {clinics?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.address || "—"}</TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell>{c._count.users}</TableCell>
                <TableCell>{c._count.patients}</TableCell>
                <TableCell>
                  {format(new Date(c.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
