import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from "./todosApi";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function DayTodoList({ date }: { date: Date }) {
  const [text, setText] = useState("");
  const { data: todos, isLoading } = useGetTodosQuery();
  const [createTodo] = useCreateTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const dayTodos = (todos ?? []).filter((t) =>
    isSameDay(new Date(t.date), date),
  );

  async function handleAdd() {
    if (!text.trim()) return;
    try {
      await createTodo({
        text: text.trim(),
        date: date.toISOString(),
      }).unwrap();
      setText("");
    } catch {
      toast.error("Failed to add");
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">My to-do — {format(date, "MMM d")}</p>

      <div className="flex gap-2">
        <Input
          placeholder="Add a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}

      <div className="space-y-1">
        {dayTodos.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground">Nothing yet.</p>
        )}
        {dayTodos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-2 rounded px-1 py-1 hover:bg-muted/50"
          >
            <Checkbox
              checked={todo.isDone}
              onCheckedChange={async (checked) => {
                try {
                  await updateTodo({
                    id: todo.id,
                    data: { isDone: !!checked },
                  }).unwrap();
                } catch {
                  toast.error("Failed to update");
                }
              }}
            />
            <span
              className={`flex-1 text-sm ${todo.isDone ? "text-muted-foreground line-through" : ""}`}
            >
              {todo.text}
            </span>
            <button
              className="opacity-0 group-hover:opacity-100"
              onClick={async () => {
                try {
                  await deleteTodo(todo.id).unwrap();
                } catch {
                  toast.error("Failed to delete");
                }
              }}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
