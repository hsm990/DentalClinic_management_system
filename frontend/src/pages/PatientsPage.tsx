import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPatientsQuery } from "@/features/patients/patientsApi";
import { CreatePatientDialog } from "@/features/patients/CreatePatientDialog";
import { ArchiveRestoreButtons } from "@/features/patients/ArchiveRestoreButtons";
import { DeletePatientButton } from "@/features/patients/DeletePatientButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

const LIMIT = 20;

export function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetPatientsQuery({
    search: search || undefined,
    includeArchived,
    page,
    limit: LIMIT,
  });

  const patients = data?.patients ?? [];
  const pagination = data?.pagination;

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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset to page 1 on a new search
          }}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Switch
            id="show-archived"
            checked={includeArchived}
            onCheckedChange={(checked) => {
              setIncludeArchived(checked);
              setPage(1);
            }}
          />
          <Label htmlFor="show-archived" className="text-sm">
            Show archived
          </Label>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                  Failed to load patients.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && patients.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            )}

            {patients.map((patient) => (
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
                <TableCell>
                  {patient.isActive ? (
                    <Badge variant="outline">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </TableCell>
                <TableCell
                  className="flex justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArchiveRestoreButtons
                    patientId={patient.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    isActive={patient.isActive}
                    size="sm"
                  />
                  <DeletePatientButton
                    patientId={patient.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} patients
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
