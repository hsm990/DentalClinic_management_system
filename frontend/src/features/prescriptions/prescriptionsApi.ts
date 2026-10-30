import { apiSlice } from "@/lib/apiBaseQuery";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface Prescription {
  id: string;
  medications: Medication[];
  instructions?: string | null;
  patientId: string;
  dentist: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface PrescriptionsResponse {
  prescriptions: Prescription[];
}
interface PrescriptionResponse {
  prescription: Prescription;
}

export const prescriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPrescriptions: builder.query<Prescription[], string>({
      query: (patientId) => `/patients/${patientId}/prescriptions`,
      transformResponse: (r: PrescriptionsResponse) => r.prescriptions,
      providesTags: (_r, _e, patientId) => [
        { type: "Prescription", id: patientId },
      ],
    }),

    createPrescription: builder.mutation<
      Prescription,
      { patientId: string; medications: Medication[]; instructions?: string }
    >({
      query: ({ patientId, ...body }) => ({
        url: `/patients/${patientId}/prescriptions`,
        method: "POST",
        body,
      }),
      transformResponse: (r: PrescriptionResponse) => r.prescription,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "Prescription", id: patientId },
      ],
    }),
  }),
});

export const { useGetPrescriptionsQuery, useCreatePrescriptionMutation } =
  prescriptionsApi;
