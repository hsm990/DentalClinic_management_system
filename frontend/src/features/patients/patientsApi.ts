import { apiSlice } from "@/lib/apiBaseQuery";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  allergies?: string | null;
  medicalNotes?: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientsListResponse {
  patients: Patient[];
}
interface PatientResponse {
  patient: Patient;
}

export const patientsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<Patient[], string | void>({
      query: (search) => ({
        url: "/patients",
        params: search ? { search } : undefined,
      }),
      transformResponse: (response: PatientsListResponse) => response.patients,
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Patient" as const, id: p.id })),
              { type: "Patient" as const, id: "LIST" },
            ]
          : [{ type: "Patient" as const, id: "LIST" }],
    }),

    createPatient: builder.mutation<Patient, Record<string, unknown>>({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      transformResponse: (response: PatientResponse) => response.patient,
      invalidatesTags: [{ type: "Patient", id: "LIST" }],
    }),

    updatePatient: builder.mutation<
      Patient,
      { id: string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `/patients/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: PatientResponse) => response.patient,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),
    getPatientById: builder.query<Patient, string>({
      query: (id) => `/patients/${id}`,
      transformResponse: (r: PatientResponse) => r.patient,
      providesTags: (_r, _e, id) => [{ type: "Patient", id }],
    }),
    deletePatient: builder.mutation<void, string>({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useGetPatientByIdQuery,
  useDeletePatientMutation,
} = patientsApi;
