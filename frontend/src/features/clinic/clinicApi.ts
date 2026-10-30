import { apiSlice } from "@/lib/apiBaseQuery";

export interface Clinic {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

interface ClinicResponse {
  clinic: Clinic;
}
export interface ClinicWithCounts extends Clinic {
  createdAt: string;
  _count: { users: number; patients: number };
}
export const clinicApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyClinic: builder.query<Clinic, void>({
      query: () => "/clinics/me",
      transformResponse: (r: ClinicResponse) => r.clinic,
      providesTags: [{ type: "Clinic", id: "ME" }],
    }),
    updateMyClinic: builder.mutation<Clinic, Record<string, unknown>>({
      query: (body) => ({ url: "/clinics/me", method: "PATCH", body }),
      transformResponse: (r: ClinicResponse) => r.clinic,
      invalidatesTags: [{ type: "Clinic", id: "ME" }],
    }),
    listAllClinics: builder.query<ClinicWithCounts[], void>({
      query: () => "/clinics",
      transformResponse: (r: { clinics: ClinicWithCounts[] }) => r.clinics,
      providesTags: [{ type: "Clinic", id: "LIST" }],
    }),

    onboardClinic: builder.mutation<
      { clinic: Clinic; admin: unknown },
      {
        clinic: { name: string; address?: string; phone?: string };
        admin: {
          email: string;
          password: string;
          firstName: string;
          lastName: string;
        };
      }
    >({
      query: (body) => ({ url: "/clinics/onboard", method: "POST", body }),
      invalidatesTags: [{ type: "Clinic", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyClinicQuery,
  useUpdateMyClinicMutation,
  useListAllClinicsQuery,
  useOnboardClinicMutation,
} = clinicApi;
