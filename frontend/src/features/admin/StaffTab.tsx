import { toast } from "sonner";
import {
  useGetStaffQuery,
  useSetStaffActiveMutation,
} from "@/features/users/usersApi";
import { CreateStaffDialog } from "./CreateStaffDialog";
import { EditStaffDialog } from "./EditStaffDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [setActive] = useSetStaffActiveMutation();

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
              <TableHead className="text-right">Actions</TableHead>
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
                  <Badge variant={s.isActive ? "default" : "secondary"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <EditStaffDialog staff={s} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await setActive({
                          id: s.id,
                          isActive: !s.isActive,
                        }).unwrap();
                        toast.success(
                          s.isActive ? "Staff deactivated" : "Staff activated",
                        );
                      } catch {
                        toast.error("Failed to update status");
                      }
                    }}
                  >
                    {s.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
