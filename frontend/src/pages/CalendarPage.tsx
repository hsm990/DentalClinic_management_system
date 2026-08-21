import { AppointmentCalendarView } from "@/features/appointments/AppointmentCalendarView";

export function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Your schedule at a glance
        </p>
      </div>
      <AppointmentCalendarView />
    </div>
  );
}
