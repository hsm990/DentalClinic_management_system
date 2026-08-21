import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthCalendarProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  countsByDate: Map<string, number>; // key: "yyyy-MM-dd"
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({
  month,
  onMonthChange,
  countsByDate,
  selectedDate,
  onSelectDate,
}: MonthCalendarProps) {
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="font-medium">{format(month, "MMMM yyyy")}</p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = countsByDate.get(key) ?? 0;
          const inMonth = isSameMonth(day, month);
          const selected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors ${
                !inMonth ? "text-muted-foreground/40" : ""
              } ${selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"} ${
                isToday(day) && !selected
                  ? "border-primary"
                  : "border-transparent"
              }`}
            >
              <span>{format(day, "d")}</span>
              {count > 0 && (
                <span
                  className={`mt-0.5 rounded-full px-1.5 text-[10px] ${
                    selected
                      ? "bg-primary-foreground/20"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
