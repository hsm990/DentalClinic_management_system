import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// generates every 30-minute slot from 08:00 to 18:00 — adjust to your clinic's real hours
const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = format(new Date(2000, 0, 1, hours, minutes), "h:mm a");
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { value, label };
});

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(value);
  const [draftTime, setDraftTime] = useState<string>(
    value ? format(value, "HH:mm") : "",
  );

  function handleConfirm() {
    if (!draftDate || !draftTime) return;
    const [hours, minutes] = draftTime.split(":").map(Number);
    const combined = new Date(draftDate);
    combined.setHours(hours, minutes, 0, 0);
    onChange(combined);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP 'at' h:mm a") : "Pick a date & time"}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={draftDate}
            onSelect={setDraftDate}
            disabled={{ before: new Date() }}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Time</p>
            <Select
              value={draftTime}
              onValueChange={(value) => {
                if (value !== null) {
                  setDraftTime(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={!draftDate || !draftTime}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
