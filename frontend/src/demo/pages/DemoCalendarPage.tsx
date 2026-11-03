import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
} from "date-fns";
import { useDemoData } from "../DemoDataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
} from "@/features/appointments/stateMachine";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DemoCalendarPage() {
  const { appointments, patients } = useDemoData();
  const [month, setMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const monthAppts = appointments.filter((a) =>
    isSameMonth(new Date(a.scheduledAt), month),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Monthly view of appointments — nothing is saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            Prev
          </Button>
          <span className="min-w-36 text-center text-sm font-medium">
            {format(month, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {monthAppts.length} appointment{monthAppts.length === 1 ? "" : "s"} this
        month
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="bg-muted/40 p-2 text-center text-xs font-medium"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dayAppts = appointments.filter((a) =>
            isSameDay(new Date(a.scheduledAt), day),
          );
          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 bg-card p-1.5 ${
                isSameMonth(day, month) ? "" : "opacity-40"
              }`}
            >
              <div className="mb-1 text-xs text-muted-foreground">
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayAppts.map((a) => {
                  const patient = patients.find((p) => p.id === a.patientId);
                  return (
                    <div
                      key={a.id}
                      className="truncate rounded-sm bg-muted px-1 py-0.5 text-[10px]"
                      title={`${format(new Date(a.scheduledAt), "h:mm a")} — ${patient?.firstName} ${patient?.lastName} (${STATUS_LABELS[a.status]})`}
                    >
                      {format(new Date(a.scheduledAt), "h:mm")}{" "}
                      {patient?.firstName}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.keys(STATUS_LABELS).map((s) => (
          <Badge key={s} variant={STATUS_BADGE_VARIANT[s as never]}>
            {STATUS_LABELS[s as never]}
          </Badge>
        ))}
      </div>
    </div>
  );
}
