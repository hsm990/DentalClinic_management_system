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

export const clinicApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyClinic: builder.query<Clinic, void>({
      query: () => "/clinics/me",
      transformResponse: (r: ClinicResponse) => r.clinic,
      providesTags: [{ type: "Clinic", id: "ME" }],
    }),
  }),
});

export const { useGetMyClinicQuery } = clinicApi;
