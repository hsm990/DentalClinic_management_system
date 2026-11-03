import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { useDemoData } from "../DemoDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function DemoTasksPage() {
  const { tasks, addTask, toggleTask } = useDemoData();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, assignee.trim() || "Unassigned");
    setTitle("");
    setAssignee("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Team notes and to-dos — nothing is saved
        </p>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          className="w-40"
          placeholder="Assign to…"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <Button type="submit">Add task</Button>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-medium">
            Open ({open.length})
          </h2>
          {open.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-md border p-3"
            >
              <Checkbox
                className="mt-1"
                checked={t.done}
                onCheckedChange={() => toggleTask(t.id)}
              />
              <div className="flex-1">
                <p className="text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.assignee} · {format(new Date(t.createdAt), "MMM d")}
                </p>
              </div>
            </div>
          ))}
          {open.length === 0 && (
            <p className="text-sm text-muted-foreground">All caught up!</p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Completed ({done.length})
          </h2>
          {done.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-md border bg-muted/30 p-3"
            >
              <Checkbox
                className="mt-1"
                checked={t.done}
                onCheckedChange={() => toggleTask(t.id)}
              />
              <div className="flex-1">
                <p className="text-sm line-through text-muted-foreground">
                  {t.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.assignee} · {format(new Date(t.createdAt), "MMM d")}
                </p>
              </div>
            </div>
          ))}
          {done.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing completed yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
