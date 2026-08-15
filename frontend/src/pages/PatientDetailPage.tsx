import { useParams, Link } from "react-router-dom";
import { useGetPatientByIdQuery } from "@/features/patients/patientsApi";
import { ToothChart } from "@/features/toothChart/ToothChart";
import { TreatmentPlansPanel } from "@/features/treatmentPlans/TreatmentPlansPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { CreateInvoiceDialog } from "@/features/billing/CreateInvoiceDialog";
import { InvoiceDetail } from "@/features/billing/InvoiceDetail";
import { useGetAppointmentsQuery } from "@/features/appointments/appointmentsApi";
import { useGetPatientInvoicesQuery } from "@/features/billing/billingApi";
import { STATUS_LABELS } from "@/features/appointments/stateMachine";
import { Badge } from "@/components/ui/badge";
import { EditPatientDialog } from "@/features/patients/EditPatientDialog";
import { DeletePatientButton } from "@/features/patients/DeletePatientButton";

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading } = useGetPatientByIdQuery(id!, {
    skip: !id,
  });

  const { data: appointments } = useGetAppointmentsQuery(
    { patientId: id },
    { skip: !id },
  );
  const { data: invoices } = useGetPatientInvoicesQuery(id!, { skip: !id });
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const displayedInvoiceId = selectedInvoiceId ?? invoices?.[0]?.id ?? null;
  const outstandingBalance = (invoices ?? []).reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(0, Number(inv.total) - paid);
  }, 0);

  const upcomingAppointments = (appointments ?? [])
    .filter(
      (a) =>
        new Date(a.scheduledAt) >= new Date() &&
        !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  // early returns now come AFTER every hook call — this is the part that matters
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!patient)
    return <p className="text-muted-foreground">Patient not found.</p>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/patients">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to patients
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.phone || "No phone on file"}
          </p>
        </div>
        <div className="flex gap-2">
          <EditPatientDialog patient={patient} />
          <DeletePatientButton
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tooth-chart">Tooth Chart</TabsTrigger>
          <TabsTrigger value="treatment-plans">Treatment Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Payment status</p>
              {outstandingBalance > 0 ? (
                <Badge variant="destructive" className="mt-1">
                  ${outstandingBalance.toFixed(2)} outstanding
                </Badge>
              ) : (
                <Badge variant="default" className="mt-1">
                  All paid up
                </Badge>
              )}
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Upcoming appointment
              </p>
              <p className="mt-1 text-sm font-medium">
                {upcomingAppointments[0]
                  ? new Date(
                      upcomingAppointments[0].scheduledAt,
                    ).toLocaleString()
                  : "None scheduled"}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total visits</p>
              <p className="mt-1 text-sm font-medium">
                {
                  (appointments ?? []).filter((a) => a.status === "COMPLETED")
                    .length
                }
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Patient details</p>
            <div className="grid gap-1 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                {patient.email || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Date of birth:</span>{" "}
                {patient.dateOfBirth || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Allergies:</span>{" "}
                {patient.allergies || "None recorded"}
              </p>
              <p>
                <span className="text-muted-foreground">Medical notes:</span>{" "}
                {patient.medicalNotes || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Appointment history</p>
            {appointments?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No appointments yet.
              </p>
            ) : (
              <div className="space-y-1">
                {appointments?.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between rounded border p-2 text-sm"
                  >
                    <span>
                      {new Date(a.scheduledAt).toLocaleDateString()} — Dr.{" "}
                      {a.dentist.firstName}
                    </span>
                    <Badge variant="outline">{STATUS_LABELS[a.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="tooth-chart" className="pt-4">
          <ToothChart patientId={patient.id} />
        </TabsContent>
        <TabsContent value="treatment-plans" className="pt-4">
          <TreatmentPlansPanel patientId={patient.id} />
        </TabsContent>
        <TabsContent value="billing" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {invoices?.map((inv) => (
                <Button
                  key={inv.id}
                  size="sm"
                  variant={
                    displayedInvoiceId === inv.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedInvoiceId(inv.id)}
                >
                  Invoice #{inv.invoiceNumber}
                </Button>
              ))}
            </div>
            <CreateInvoiceDialog
              patientId={patient.id}
              onCreated={(newId) => setSelectedInvoiceId(newId)}
            />
          </div>

          {displayedInvoiceId ? (
            <InvoiceDetail invoiceId={displayedInvoiceId} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No invoices yet. Create one from completed treatment items.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
