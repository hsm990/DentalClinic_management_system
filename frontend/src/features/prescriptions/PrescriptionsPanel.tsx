import { useGetMyClinicQuery } from "@/features/clinic/clinicApi";
import { useGetPrescriptionsQuery } from "./prescriptionsApi";
import { CreatePrescriptionDialog } from "./CreatePrescriptionDialog";
import { PrintablePrescription } from "./PrintablePrescription";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { useState } from "react";

export function PrescriptionsPanel({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const { data: prescriptions, isLoading } =
    useGetPrescriptionsQuery(patientId);
  const { data: clinic } = useGetMyClinicQuery();
  const [printingId, setPrintingId] = useState<string | null>(null);

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const printingPrescription = prescriptions?.find((p) => p.id === printingId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <CreatePrescriptionDialog patientId={patientId} />
      </div>

      {prescriptions?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No prescriptions yet.
        </p>
      )}

      <div className="space-y-3 no-print">
        {prescriptions?.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(p.createdAt), "MMM d, yyyy")} — Dr.{" "}
                  {p.dentist.firstName} {p.dentist.lastName}
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                  {p.medications.map((m, i) => (
                    <li key={i}>
                      {m.name} — {m.dosage}, {m.frequency}
                      {m.duration ? `, ${m.duration}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPrintingId(p.id);
                  setTimeout(() => window.print(), 50); // let the print area render first
                }}
              >
                <Printer className="mr-1 h-4 w-4" /> Print
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {printingPrescription && (
        <PrintablePrescription
          prescription={printingPrescription}
          clinicName={clinic?.name ?? "Clinic"}
          patientName={patientName}
        />
      )}
    </div>
  );
}
