import { toast } from "sonner";
import { format } from "date-fns";
import {
  useGetOrthoCasesQuery,
  useUpdateOrthoCaseStatusMutation,
} from "./orthodonticsApi";
import { CreateOrthoCaseDialog } from "./CreateOrthoCaseDialog";
import { AddVisitDialog } from "./AddVisitDialog";
import { CASE_STATUS_LABELS, CASE_STATUS_VARIANT } from "./constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function OrthodonticsPanel({ patientId }: { patientId: string }) {
  const { data: cases, isLoading } = useGetOrthoCasesQuery(patientId);
  const [updateStatus] = useUpdateOrthoCaseStatusMutation();

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateOrthoCaseDialog patientId={patientId} />
      </div>

      {cases?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No orthodontic cases yet.
        </p>
      )}

      {cases?.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{c.applianceType}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Started {format(new Date(c.startDate), "MMM d, yyyy")}
                {c.estimatedEndDate
                  ? ` · Est. end ${format(new Date(c.estimatedEndDate), "MMM d, yyyy")}`
                  : ""}
                {" · Dr. "}
                {c.dentist.firstName} {c.dentist.lastName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={CASE_STATUS_VARIANT[c.status]}>
                {CASE_STATUS_LABELS[c.status]}
              </Badge>
              {c.status === "ACTIVE" && (
                <AddVisitDialog caseId={c.id} patientId={patientId} />
              )}
              {c.status === "ACTIVE" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await updateStatus({
                        caseId: c.id,
                        patientId,
                        status: "COMPLETED",
                      }).unwrap();
                      toast.success("Case marked completed");
                    } catch {
                      toast.error("Could not update case");
                    }
                  }}
                >
                  Mark completed
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {c.visits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No visits logged yet.
              </p>
            ) : (
              <div className="space-y-2">
                {c.visits.map((v) => (
                  <div key={v.id} className="rounded-md border p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {format(new Date(v.visitDate), "MMM d, yyyy")}
                      </span>
                      {v.createdBy && (
                        <span className="text-xs text-muted-foreground">
                          by {v.createdBy.firstName}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground">{v.notes}</p>
                    {v.nextVisitDate && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Next visit:{" "}
                        {format(new Date(v.nextVisitDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
