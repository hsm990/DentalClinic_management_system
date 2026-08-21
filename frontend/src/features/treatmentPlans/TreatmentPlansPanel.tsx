import { useGetTreatmentPlansQuery } from "./treatmentPlansApi";
import { CreatePlanDialog } from "./CreatePlanDialog";
import { AddPlanItemDialog } from "./AddPlanItemDialog";
import { PlanItemStatusActions } from "./PlanItemStatusActions";
import { ITEM_STATUS_LABELS, ITEM_STATUS_VARIANT } from "./stateMachine";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useDeleteTreatmentPlanMutation } from "./treatmentPlansApi";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export function TreatmentPlansPanel({ patientId }: { patientId: string }) {
  const { data: plans, isLoading } = useGetTreatmentPlansQuery(patientId);
  const [deletePlan, { isLoading: deleting }] =
    useDeleteTreatmentPlanMutation();

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
            <div>
              <CardTitle className="text-base">{plan.title}</CardTitle>
              {plan.createdBy && (
                <p className="text-xs text-muted-foreground">
                  Created by {plan.createdBy.firstName}{" "}
                  {plan.createdBy.lastName}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <AddPlanItemDialog planId={plan.id} patientId={patientId} />
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="outline" size="sm">
                      Delete plan
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete this treatment plan?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Only possible when no items are marked Completed. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleting}
                      onClick={async () => {
                        try {
                          await deletePlan({
                            planId: plan.id,
                            patientId,
                          }).unwrap();
                          toast.success("Treatment plan deleted");
                        } catch (err: any) {
                          if (err?.status === 409) {
                            toast.error(
                              "Cannot delete: plan has completed items",
                            );
                          } else {
                            toast.error("Failed to delete plan");
                          }
                        }
                      }}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
                    <TableHead>createdBy</TableHead>
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
                      <TableCell>
                        {item.createdBy && (
                          <p className="text-xs text-muted-foreground">
                            by {item.createdBy.firstName}
                          </p>
                        )}
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
