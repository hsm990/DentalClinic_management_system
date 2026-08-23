import { useGetTasksQuery } from "@/features/tasks/tasksApi";
import { CreateTaskDialog } from "@/features/tasks/CreateTaskDialog";
import { TaskCard } from "@/features/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";

export function TasksPage() {
  const { data: tasks, isLoading } = useGetTasksQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Notes and to-dos for the clinic team
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && tasks?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No tasks yet.
        </p>
      )}

      <div className="space-y-2">
        {tasks?.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
