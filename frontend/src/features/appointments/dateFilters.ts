import type { Appointment } from "./appointmentsApi";

export type DateFilter = "all" | "today" | "todayAndFuture";

function isToday(date: Date, now: Date): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function bucketAppointments(appointments: Appointment[]) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const today: Appointment[] = [];
  const future: Appointment[] = [];
  const past: Appointment[] = [];

  for (const appt of appointments) {
    const d = new Date(appt.scheduledAt);
    if (isToday(d, now)) {
      today.push(appt);
    } else if (d >= startOfToday) {
      future.push(appt);
    } else {
      past.push(appt);
    }
  }

  return { today, future, past, all: appointments };
}

export function filterAppointments(
  appointments: Appointment[],
  filter: DateFilter,
): Appointment[] {
  const { today, future, past, all } = bucketAppointments(appointments);
  switch (filter) {
    case "today":
      return today;
    case "todayAndFuture":
      return [...today, ...future];
    case "all":
    default:
      return all;
  }
}
