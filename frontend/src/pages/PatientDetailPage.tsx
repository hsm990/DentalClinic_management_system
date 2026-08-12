import { useParams, Link } from "react-router-dom";
import { useGetPatientByIdQuery } from "@/features/patients/patientsApi";
import { ToothChart } from "@/features/toothChart/ToothChart";
import { TreatmentPlansPanel } from "@/features/treatmentPlans/TreatmentPlansPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading } = useGetPatientByIdQuery(id!, {
    skip: !id,
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!patient)
    return <p className="text-muted-foreground">Patient not found.</p>;

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tooth-chart">Tooth Chart</TabsTrigger>
          <TabsTrigger value="treatment-plans">Treatment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-2 pt-4">
          <p>
            <span className="font-medium">Email:</span> {patient.email || "—"}
          </p>
          <p>
            <span className="font-medium">Date of birth:</span>{" "}
            {patient.dateOfBirth || "—"}
          </p>
          <p>
            <span className="font-medium">Allergies:</span>{" "}
            {patient.allergies || "None recorded"}
          </p>
          <p>
            <span className="font-medium">Medical notes:</span>{" "}
            {patient.medicalNotes || "—"}
          </p>
        </TabsContent>

        <TabsContent value="tooth-chart" className="pt-4">
          <ToothChart patientId={patient.id} />
        </TabsContent>

        <TabsContent value="treatment-plans" className="pt-4">
          <TreatmentPlansPanel patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
