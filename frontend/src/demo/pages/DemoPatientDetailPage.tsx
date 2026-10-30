import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDemoData } from "../DemoDataContext";
import {
  getNextItemStatuses,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_VARIANT,
} from "@/features/treatmentPlans/stateMachine";
import {
  CONDITION_LABELS,
  CONDITION_COLORS,
  UPPER_RIGHT,
  UPPER_LEFT,
  LOWER_RIGHT,
  LOWER_LEFT,
} from "@/features/toothChart/constants";
import type { ToothCondition } from "@/features/toothChart/toothChartApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const ALL_CONDITIONS = Object.keys(CONDITION_LABELS) as ToothCondition[];

export function DemoPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    patients,
    toothCharts,
    treatmentPlans,
    procedures,
    invoices,
    upsertTooth,
    updatePlanItemStatus,
    createInvoiceFromItem,
    recordPayment,
  } = useDemoData();

  const patient = patients.find((p) => p.id === id);
  if (!patient)
    return <p className="text-muted-foreground">Patient not found.</p>;

  const chart = toothCharts[patient.id] ?? [];
  const plan = treatmentPlans.find((p) => p.patientId === patient.id);
  const invoice = invoices.find((inv) => inv.patientId === patient.id);

  function renderRow(numbers: number[]) {
    return (
      <div className="grid grid-cols-8 gap-1.5">
        {numbers.map((n) => {
          const entry = chart.find((e) => e.toothNumber === n);
          const condition = entry?.condition ?? "HEALTHY";
          return (
            <DemoTooth
              key={n}
              toothNumber={n}
              condition={condition}
              patientId={patient?.id as any}
              upsertTooth={upsertTooth}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => navigate("/try/patients")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to patients
        </Button>
        <h1 className="text-2xl font-semibold">
          {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">{patient.phone}</p>
      </div>

      <Tabs defaultValue="tooth-chart">
        <TabsList>
          <TabsTrigger value="tooth-chart">Tooth Chart</TabsTrigger>
          <TabsTrigger value="treatment-plans">Treatment Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="tooth-chart" className="pt-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="grid grid-cols-2 gap-1.5">
              {renderRow(UPPER_RIGHT)}
              {renderRow(UPPER_LEFT)}
            </div>
            <div className="my-4 border-t" />
            <div className="grid grid-cols-2 gap-1.5">
              {renderRow(LOWER_RIGHT)}
              {renderRow(LOWER_LEFT)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="treatment-plans" className="pt-4">
          {!plan ? (
            <p className="text-sm text-muted-foreground">
              No treatment plan for this patient in the demo.
            </p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{plan.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Procedure</TableHead>
                      <TableHead>Tooth</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.items.map((item) => {
                      const procedure = procedures.find(
                        (p) => p.id === item.procedureId,
                      );
                      const nextStatuses = getNextItemStatuses(item.status);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{procedure?.name}</TableCell>
                          <TableCell>{item.toothNumber}</TableCell>
                          <TableCell>
                            {item.estimatedCost.toLocaleString()} DA
                          </TableCell>
                          <TableCell>
                            <Badge variant={ITEM_STATUS_VARIANT[item.status]}>
                              {ITEM_STATUS_LABELS[item.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-1.5">
                            {nextStatuses.map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updatePlanItemStatus(plan.id, item.id, s)
                                }
                              >
                                {ITEM_STATUS_LABELS[s]}
                              </Button>
                            ))}
                            {item.status === "COMPLETED" && !item.invoiced && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  createInvoiceFromItem(plan.id, item.id)
                                }
                              >
                                Invoice
                              </Button>
                            )}
                            {item.invoiced && (
                              <span className="self-center text-xs text-muted-foreground">
                                Invoiced
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
          {!invoice ? (
            <p className="text-sm text-muted-foreground">
              No invoice yet — mark a treatment item completed and invoice it.
            </p>
          ) : (
            <DemoInvoiceCard invoice={invoice} recordPayment={recordPayment} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DemoTooth({
  toothNumber,
  condition,
  patientId,
  upsertTooth,
}: {
  toothNumber: number;
  condition: ToothCondition;
  patientId: string;
  upsertTooth: (
    patientId: string,
    toothNumber: number,
    condition: ToothCondition,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={`flex aspect-square items-center justify-center rounded-md border-2 text-xs font-medium hover:opacity-80 ${CONDITION_COLORS[condition]}`}
          >
            {toothNumber}
          </button>
        }
      />
      <PopoverContent className="w-56 space-y-2">
        <p className="text-sm font-medium">Tooth {toothNumber}</p>
        <Select
          items={ALL_CONDITIONS.map((c) => ({
            value: c,
            label: CONDITION_LABELS[c],
          }))}
          value={condition}
          onValueChange={(v) => {
            upsertTooth(patientId, toothNumber, v as ToothCondition);
            setOpen(false);
          }}
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
      </PopoverContent>
    </Popover>
  );
}

function DemoInvoiceCard({
  invoice,
  recordPayment,
}: {
  invoice: any;
  recordPayment: (id: string, amount: number, method: string) => void;
}) {
  const paid = invoice.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const remaining = invoice.total - paid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Invoice #{invoice.invoiceNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoice.items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.procedureName}{" "}
              {item.toothNumber ? `(tooth ${item.toothNumber})` : ""}
            </span>
            <span>{item.total.toLocaleString()} DA</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 text-sm font-medium">
          <span>Remaining</span>
          <span>{remaining.toLocaleString()} DA</span>
        </div>
        {remaining > 0 && (
          <Button
            size="sm"
            onClick={() => recordPayment(invoice.id, remaining, "CASH")}
          >
            Record full payment
          </Button>
        )}
        {remaining <= 0 && <Badge>Paid</Badge>}
      </CardContent>
    </Card>
  );
}
