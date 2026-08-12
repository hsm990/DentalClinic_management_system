import { useGetTreatmentPlansQuery } from "./treatmentPlansApi";
import { CreatePlanDialog } from "./CreatePlanDialog";
import { AddPlanItemDialog } from "./AddPlanItemDialog";
import { PlanItemStatusActions } from "./PlanItemStatusActions";
import { ITEM_STATUS_LABELS, ITEM_STATUS_VARIANT } from "./stateMachine";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function TreatmentPlansPanel({ patientId }: { patientId: string }) {
  const { data: plans, isLoading } = useGetTreatmentPlansQuery(patientId);

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreatePlanDialog patientId={patientId} />
      </div>

      {plans?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No treatment plans yet.
        </p>
      )}

      {plans?.map((plan) => (
        <Card key={plan.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{plan.title}</CardTitle>
            <AddPlanItemDialog planId={plan.id} patientId={patientId} />
          </CardHeader>
          <CardContent>
            {plan.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Tooth</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.procedure.name}</TableCell>
                      <TableCell>{item.toothNumber ?? "—"}</TableCell>
                      <TableCell>${item.estimatedCost}</TableCell>
                      <TableCell>
                        <Badge variant={ITEM_STATUS_VARIANT[item.status]}>
                          {ITEM_STATUS_LABELS[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PlanItemStatusActions
                          item={item}
                          patientId={patientId}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
