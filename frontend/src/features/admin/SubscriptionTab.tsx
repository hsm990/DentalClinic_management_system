import { format } from "date-fns";
import { useGetMyClinicQuery } from "@/features/clinic/clinicApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PLAN_LABELS: Record<string, string> = {
  TRIAL: "Free trial",
  BASIC: "Basic",
  PRO: "Pro",
};

export function SubscriptionTab() {
  const { data: clinic, isLoading } = useGetMyClinicQuery();

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!clinic) return null;

  const daysLeft = clinic.paidUntil
    ? Math.ceil((new Date(clinic.paidUntil).getTime() - Date.now()) / 86400000)
    : null;
  const ending = daysLeft !== null && daysLeft <= 7;

  return (
    <Card className="max-w-lg">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-lg font-semibold">
              {PLAN_LABELS[clinic.plan ?? "TRIAL"] ?? clinic.plan}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time left</p>
            {daysLeft === null ? (
              <p className="text-lg font-semibold">No end date</p>
            ) : (
              <p
                className={`text-lg font-semibold ${ending ? "text-amber-600" : ""}`}
              >
                {daysLeft <= 0
                  ? "Ends today"
                  : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
              </p>
            )}
          </div>
        </div>

        {clinic.paidUntil && (
          <div className="border-t pt-4 text-sm">
            <span className="text-muted-foreground">Access until: </span>
            {format(new Date(clinic.paidUntil), "MMMM d, yyyy")}
          </div>
        )}

        <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
          To renew or change your plan, contact us. Access is extended as soon
          as your payment is confirmed.
        </div>
      </CardContent>
    </Card>
  );
}
