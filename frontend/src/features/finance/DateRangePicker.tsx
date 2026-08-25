import {
  startOfMonth,
  endOfMonth,
  subDays,
  startOfYear,
  format,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RangePreset = "thisMonth" | "last30" | "thisYear" | "custom";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  preset: RangePreset;
  onChange: (from: Date, to: Date, preset: RangePreset) => void;
}

export function DateRangePicker({
  from,
  to,
  preset,
  onChange,
}: DateRangePickerProps) {
  function applyPreset(p: RangePreset) {
    const now = new Date();
    if (p === "thisMonth") onChange(startOfMonth(now), endOfMonth(now), p);
    else if (p === "last30") onChange(subDays(now, 30), now, p);
    else if (p === "thisYear") onChange(startOfYear(now), now, p);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant={preset === "thisMonth" ? "default" : "outline"}
        onClick={() => applyPreset("thisMonth")}
      >
        This month
      </Button>
      <Button
        size="sm"
        variant={preset === "last30" ? "default" : "outline"}
        onClick={() => applyPreset("last30")}
      >
        Last 30 days
      </Button>
      <Button
        size="sm"
        variant={preset === "thisYear" ? "default" : "outline"}
        onClick={() => applyPreset("thisYear")}
      >
        This year
      </Button>
      <div className="ml-2 flex items-center gap-2">
        <Input
          type="date"
          className="w-36"
          value={format(from, "yyyy-MM-dd")}
          onChange={(e) => onChange(new Date(e.target.value), to, "custom")}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          className="w-36"
          value={format(to, "yyyy-MM-dd")}
          onChange={(e) => onChange(from, new Date(e.target.value), "custom")}
        />
      </div>
    </div>
  );
}
