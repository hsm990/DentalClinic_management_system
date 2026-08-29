import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
} from "date-fns";
import { useAppSelector } from "@/app/hooks";
import { useGetAppointmentsQuery } from "./appointmentsApi";
import { MonthCalendar } from "./MonthCalendar";
import { StatusActions } from "./StatusActions";
import { STATUS_LABELS, STATUS_BADGE_VARIANT } from "./stateMachine";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTasksQuery } from "@/features/tasks/tasksApi";
import { TaskCard } from "@/features/tasks/TaskCard";
import { DayTodoList } from "@/features/todos/DayTodoList";

export function AppointmentCalendarView() {
  const user = useAppSelector((state) => state.auth.user);
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { data: allTasks } = useGetTasksQuery();

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    return (allTasks ?? []).filter(
      (t) => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate),
    );
  }, [allTasks, selectedDate]);
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));

  // dentists only ever see their own schedule — receptionists/admins/
  // assistants see the whole clinic, matching how a real front desk works
  const { data: appointments, isLoading } = useGetAppointmentsQuery({
    from: gridStart.toISOString(),
    to: gridEnd.toISOString(),
    ...(user?.role === "DENTIST" ? { dentistId: user.id } : {}),
  });

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const appt of appointments ?? []) {
      const key = format(new Date(appt.scheduledAt), "yyyy-MM-dd");
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  const selectedDayAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return (appointments ?? [])
      .filter((a) => isSameDay(new Date(a.scheduledAt), selectedDate))
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [appointments, selectedDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <MonthCalendar
        month={month}
        onMonthChange={setMonth}
        countsByDate={countsByDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div className="space-y-3">
        <p className="font-medium">
          {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a day"}
        </p>

        {isLoading && <Skeleton className="h-40 w-full" />}

        {!isLoading && selectedDayAppointments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No appointments this day.
          </p>
        )}

        <div className="space-y-2">
          {selectedDayAppointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(appt.scheduledAt), "h:mm a")} —{" "}
                  {appt.patient.firstName} {appt.patient.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dr. {appt.dentist.firstName} {appt.dentist.lastName}
                  {appt.reason ? ` · ${appt.reason}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_BADGE_VARIANT[appt.status]}>
                  {STATUS_LABELS[appt.status]}
                </Badge>
                <StatusActions appointment={appt} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedDayTasks.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Tasks due</p>
          {selectedDayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
      {selectedDate && (
        <div className="mt-4 border-t pt-4">
          <DayTodoList date={selectedDate} />
        </div>
      )}
    </div>
  );
}
