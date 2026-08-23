import { toast } from "sonner";
import { format } from "date-fns";
import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from "./tasksApi";
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANT } from "./constants";
import type { Task, TaskStatus } from "./tasksApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/app/hooks";

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: null,
};

export function TaskCard({ task }: { task: Task }) {
  const user = useAppSelector((state) => state.auth.user);
  const [updateStatus, { isLoading: updating }] = useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const canDelete = task.createdById === user?.id || user?.role === "ADMIN";
  const nextStatus = NEXT_STATUS[task.status];

  const targetLabel =
    task.targetType === "CLINIC"
      ? "Everyone"
      : task.targetType === "ROLE"
        ? task.targetRole
        : task.targetUser
          ? `${task.targetUser.firstName} ${task.targetUser.lastName}`
          : "—";

  return (
    <div className="flex items-start justify-between rounded-md border p-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{task.title}</p>
          <Badge variant={TASK_STATUS_VARIANT[task.status]}>
            {TASK_STATUS_LABELS[task.status]}
          </Badge>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          For {targetLabel} · by {task.createdBy.firstName}
          {task.dueDate
            ? ` · Due ${format(new Date(task.dueDate), "MMM d")}`
            : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {nextStatus && (
          <Button
            size="sm"
            variant="outline"
            disabled={updating}
            onClick={async () => {
              try {
                await updateStatus({
                  id: task.id,
                  status: nextStatus,
                }).unwrap();
              } catch {
                toast.error("Could not update task");
              }
            }}
          >
            Mark {TASK_STATUS_LABELS[nextStatus]}
          </Button>
        )}
        {canDelete && (
          <Button
            size="sm"
            variant="ghost"
            disabled={deleting}
            onClick={async () => {
              try {
                await deleteTask(task.id).unwrap();
                toast.success("Task deleted");
              } catch {
                toast.error("Could not delete task");
              }
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
