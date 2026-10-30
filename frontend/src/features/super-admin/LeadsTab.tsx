import { format } from "date-fns";
import { toast } from "sonner";
import {
  useGetLeadsQuery,
  useUpdateLeadStatusMutation,
} from "@/features/leads/leadsApi";
import type { LeadStatus } from "@/features/leads/leadsApi";
import { OnboardClinicDialog } from "./OnboardClinicDialog";
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

const STATUS_VARIANT: Record<
  LeadStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEW: "default",
  CONTACTED: "secondary",
  CONVERTED: "outline",
  DECLINED: "destructive",
};

export function LeadsTab() {
  const { data: leads, isLoading } = useGetLeadsQuery();
  const [updateStatus] = useUpdateLeadStatusMutation();

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinic</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                No leads yet.
              </TableCell>
            </TableRow>
          )}
          {leads?.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.clinicName}</TableCell>
              <TableCell>{lead.contactName}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.phone || "—"}</TableCell>
              <TableCell>
                {format(new Date(lead.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[lead.status]}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {lead.status === "NEW" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await updateStatus({
                          id: lead.id,
                          status: "CONTACTED",
                        }).unwrap();
                      } catch {
                        toast.error("Failed to update");
                      }
                    }}
                  >
                    Mark contacted
                  </Button>
                )}
                {lead.status !== "CONVERTED" && lead.status !== "DECLINED" && (
                  <OnboardClinicDialog
                    trigger={<Button size="sm">Onboard</Button>}
                    prefill={{
                      clinicName: lead.clinicName,
                      contactName: lead.contactName,
                      email: lead.email,
                      phone: lead.phone ?? undefined,
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
