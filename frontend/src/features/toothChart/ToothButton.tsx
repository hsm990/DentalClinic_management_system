import { useState } from "react";
import { toast } from "sonner";
import { useUpsertToothMutation } from "./toothChartApi";
import { CONDITION_LABELS, CONDITION_COLORS } from "./constants";
import type { ToothChartEntry, ToothCondition } from "./toothChartApi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ALL_CONDITIONS = Object.keys(CONDITION_LABELS) as ToothCondition[];

interface ToothButtonProps {
  patientId: string;
  toothNumber: number;
  entry?: ToothChartEntry;
}

export function ToothButton({
  patientId,
  toothNumber,
  entry,
}: ToothButtonProps) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<ToothCondition>(
    entry?.condition ?? "HEALTHY",
  );
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [upsertTooth, { isLoading }] = useUpsertToothMutation();

  const currentCondition = entry?.condition ?? "HEALTHY";

  async function handleSave() {
    try {
      await upsertTooth({
        patientId,
        toothNumber,
        condition,
        notes: notes || undefined,
      }).unwrap();
      toast.success(`Tooth ${toothNumber} updated`);
      setOpen(false);
    } catch {
      toast.error("Failed to update tooth");
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setCondition(entry?.condition ?? "HEALTHY");
          setNotes(entry?.notes ?? "");
        }
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className={`flex aspect-square items-center justify-center rounded-md border-2 text-xs font-medium transition-colors hover:opacity-80 ${CONDITION_COLORS[currentCondition]}`}
          >
            {toothNumber}
          </button>
        }
      />
      <PopoverContent className="w-64 space-y-3">
        <p className="text-sm font-medium">Tooth {toothNumber}</p>

        <Select
          items={ALL_CONDITIONS.map((c) => ({
            value: c,
            label: CONDITION_LABELS[c],
          }))}
          value={condition}
          onValueChange={(v) => setCondition(v as ToothCondition)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {CONDITION_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <Button
          size="sm"
          className="w-full"
          disabled={isLoading}
          onClick={handleSave}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
