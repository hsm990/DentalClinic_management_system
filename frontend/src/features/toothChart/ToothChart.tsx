import { useGetToothChartQuery } from "./toothChartApi";
import { ToothButton } from "./ToothButton";
import {
  UPPER_RIGHT,
  UPPER_LEFT,
  LOWER_RIGHT,
  LOWER_LEFT,
  CONDITION_LABELS,
  CONDITION_COLORS,
} from "./constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { ToothCondition } from "./toothChartApi";

const ALL_CONDITIONS = Object.keys(CONDITION_LABELS) as ToothCondition[];

export function ToothChart({ patientId }: { patientId: string }) {
  const { data: chart, isLoading } = useGetToothChartQuery(patientId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const entryMap = new Map(chart?.map((e) => [e.toothNumber, e]));

  function renderRow(numbers: number[]) {
    return (
      <div className="grid grid-cols-8 gap-1.5">
        {numbers.map((n) => (
          <ToothButton
            key={n}
            patientId={patientId}
            toothNumber={n}
            entry={entryMap.get(n)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Upper right</span>
          <span>Upper left</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {renderRow(UPPER_RIGHT)}
          {renderRow(UPPER_LEFT)}
        </div>

        <div className="my-4 border-t" />

        <div className="grid grid-cols-2 gap-1.5">
          {renderRow(LOWER_RIGHT)}
          {renderRow(LOWER_LEFT)}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Lower right</span>
          <span>Lower left</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {ALL_CONDITIONS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs">
            <span className={`h-3 w-3 rounded border ${CONDITION_COLORS[c]}`} />
            {CONDITION_LABELS[c]}
          </div>
        ))}
      </div>
    </div>
  );
}
