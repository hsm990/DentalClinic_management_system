import { useState } from "react";
import { Navigate } from "react-router-dom";
import { startOfMonth, endOfMonth } from "date-fns";
import { useAppSelector } from "@/app/hooks";
import { useGetFinanceSummaryQuery } from "@/features/billing/billingApi";
import {
  DateRangePicker,
  type RangePreset,
} from "@/features/finance/DateRangePicker";
import { RevenueLineChart } from "@/features/finance/RevenueLineChart";
import { CategoryPieChart } from "@/features/finance/CategoryPieChart";
import { MethodBarChart } from "@/features/finance/MethodBarChart";
import { StatCard } from "@/features/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Wallet, FileText, CreditCard } from "lucide-react";

export function FinancePage() {
  const user = useAppSelector((state) => state.auth.user);
  const now = new Date();
  const [from, setFrom] = useState(startOfMonth(now));
  const [to, setTo] = useState(endOfMonth(now));
  const [preset, setPreset] = useState<RangePreset>("thisMonth");

  const isAdmin = user?.role === "ADMIN";

  const { data: summary, isLoading } = useGetFinanceSummaryQuery(
    {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    {
      skip: !isAdmin,
    },
  );

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finance</h1>
        <p className="text-sm text-muted-foreground">
          Revenue, billing, and outstanding balances
        </p>
      </div>

      <DateRangePicker
        from={from}
        to={to}
        preset={preset}
        onChange={(f, t, p) => {
          setFrom(f);
          setTo(t);
          setPreset(p);
        }}
      />

      {isLoading && <Skeleton className="h-24 w-full" />}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Revenue collected"
              value={`$${summary.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              tone="success"
            />
            <StatCard
              label="Total billed"
              value={`$${summary.totalBilled.toFixed(2)}`}
              icon={FileText}
            />
            <StatCard
              label="Outstanding (all time)"
              value={`$${summary.totalOutstanding.toFixed(2)}`}
              icon={Wallet}
              tone={summary.totalOutstanding > 0 ? "warning" : "success"}
            />
            <StatCard
              label="Payments recorded"
              value={summary.paymentCount}
              icon={CreditCard}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue over time</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueLineChart data={summary.revenueByDay} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Revenue by payment method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MethodBarChart data={summary.revenueByMethod} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Billed amount by category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={summary.revenueByCategory} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
