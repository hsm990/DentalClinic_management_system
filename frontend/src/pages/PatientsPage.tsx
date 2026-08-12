import { useState } from "react";
import { useGetPatientsQuery } from "@/features/patients/patientsApi";
import { CreatePatientDialog } from "@/features/patients/CreatePatientDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

export function PatientsPage() {
  const [search, setSearch] = useState("");
  const {
    data: patients,
    isLoading,
    isError,
  } = useGetPatientsQuery(search || undefined);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Manage patient records
          </p>
        </div>
        <CreatePatientDialog />
      </div>

      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Allergies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  Failed to load patients.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && patients?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            )}

            {patients?.map((patient) => (
              <TableRow
                key={patient.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <TableCell className="font-medium">
                  {patient.firstName} {patient.lastName}
                </TableCell>
                <TableCell>{patient.phone || "—"}</TableCell>
                <TableCell>{patient.email || "—"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {patient.allergies || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
