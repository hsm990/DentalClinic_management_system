import type { Prescription } from "./prescriptionsApi";

interface PrintablePrescriptionProps {
  prescription: Prescription;
  clinicName: string;
  patientName: string;
}

export function PrintablePrescription({
  prescription,
  clinicName,
  patientName,
}: PrintablePrescriptionProps) {
  return (
    <div
      id="prescription-print-area"
      className="hidden print:block bg-white p-8 text-black"
    >
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{clinicName}</h1>
          <p className="text-sm text-gray-600">Prescription</p>
        </div>
        <div className="text-right text-sm">
          <p>Date: {new Date(prescription.createdAt).toLocaleDateString()}</p>
          <p>Patient: {patientName}</p>
          <p>
            Dr. {prescription.dentist.firstName} {prescription.dentist.lastName}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">Medication</th>
            <th className="py-2">Dosage</th>
            <th className="py-2">Frequency</th>
            <th className="py-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {prescription.medications.map((m, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{m.name}</td>
              <td className="py-2">{m.dosage}</td>
              <td className="py-2">{m.frequency}</td>
              <td className="py-2">{m.duration || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {prescription.instructions && (
        <div className="mt-6">
          <p className="text-sm font-semibold">Instructions</p>
          <p className="text-sm text-gray-700">{prescription.instructions}</p>
        </div>
      )}

      <div className="mt-16 flex justify-end">
        <div className="text-center text-sm">
          <div className="mb-1 h-10 border-b border-gray-400 w-48" />
          <p className="text-gray-500">Signature</p>
        </div>
      </div>
    </div>
  );
}
