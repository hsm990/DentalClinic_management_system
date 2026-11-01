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
    <Card className="rounded-lg border-[#E5EAE6] bg-[#FBFCFB]">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="max-w-[10rem] text-[10px] leading-4 uppercase tracking-wider text-[#7B867F]">
            {label}
          </p>
          <p
            className={`ff-mono mt-2 text-lg font-medium ${TONE_CLASSES[tone]}`}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div className="rounded-lg border border-[#E2E7E3] bg-white p-2.5">
            <Icon className="h-4 w-4 text-[#1F5D4C]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
