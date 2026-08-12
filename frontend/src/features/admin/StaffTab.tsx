import { useGetStaffQuery } from "@/features/users/usersApi";
import { CreateStaffDialog } from "./CreateStaffDialog";
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

export function StaffTab() {
  const { data: staff, isLoading } = useGetStaffQuery();

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateStaffDialog />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  {s.firstName} {s.lastName}
                </TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{s.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "default" : "destructive"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
