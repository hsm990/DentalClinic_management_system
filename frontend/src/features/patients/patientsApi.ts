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
  isActive: boolean; // new
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PatientsListResponse {
  patients: Patient[];
  pagination: PaginationInfo;
}
interface PatientResponse {
  patient: Patient;
}

interface GetPatientsArgs {
  search?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}

export const patientsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PatientsListResponse, GetPatientsArgs | void>({
      query: (args) => ({
        url: "/patients",
        params: {
          search: args?.search || undefined,
          includeArchived: args?.includeArchived ? "true" : undefined,
          page: args?.page,
          limit: args?.limit,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.patients.map((p) => ({
                type: "Patient" as const,
                id: p.id,
              })),
              { type: "Patient" as const, id: "LIST" },
            ]
          : [{ type: "Patient" as const, id: "LIST" }],
    }),

    getPatientById: builder.query<Patient, string>({
      query: (id) => `/patients/${id}`,
      transformResponse: (r: PatientResponse) => r.patient,
      providesTags: (_r, _e, id) => [{ type: "Patient", id }],
    }),

    createPatient: builder.mutation<Patient, Record<string, unknown>>({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      transformResponse: (r: PatientResponse) => r.patient,
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
      transformResponse: (r: PatientResponse) => r.patient,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),

    deletePatient: builder.mutation<void, string>({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),

    archivePatient: builder.mutation<Patient, string>({
      query: (id) => ({ url: `/patients/${id}/archive`, method: "PATCH" }),
      transformResponse: (r: PatientResponse) => r.patient,
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),

    restorePatient: builder.mutation<Patient, string>({
      query: (id) => ({ url: `/patients/${id}/restore`, method: "PATCH" }),
      transformResponse: (r: PatientResponse) => r.patient,
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useArchivePatientMutation,
  useRestorePatientMutation,
} = patientsApi;
