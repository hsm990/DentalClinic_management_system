import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success";
}

const TONE_CLASSES = {
  default: "text-foreground",
  warning: "text-amber-600",
  success: "text-emerald-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-lg bg-muted p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-xl font-semibold ${TONE_CLASSES[tone]}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
