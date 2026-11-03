import { apiSlice } from "@/lib/apiBaseQuery";

export interface Clinic {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  plan?: string;
  paidUntil?: string | null;
}
export interface ClinicWithCounts extends Clinic {
  createdAt: string;
  isActive: boolean;
  plan: "TRIAL" | "BASIC" | "PRO";
  paidUntil: string | null;
  lastLoginAt: string | null;
  _count: { users: number; patients: number };
  admins: { id: string; email: string; firstName: string; lastName: string }[];
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
      { clinic: Clinic; admin: unknown; leadId?: any },
      {
        clinic: { name: string; address?: string; phone?: string };
        admin: {
          email: string;
          password: string;
          firstName: string;
          lastName: string;
        };
        leadId: any;
      }
    >({
      query: (body) => ({ url: "/clinics/onboard", method: "POST", body }),
      invalidatesTags: [{ type: "Clinic", id: "LIST" }],
    }),
    setClinicActive: builder.mutation<
      { clinic: Clinic },
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/clinics/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: [{ type: "Clinic", id: "LIST" }],
    }),
    updateSubscription: builder.mutation<
      { clinic: Clinic },
      { id: string; plan: string; paidUntil: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/clinics/${id}/subscription`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Clinic", id: "LIST" }],
    }),
    resetAdminPassword: builder.mutation<
      { message: string },
      { id: string; adminId: string; newPassword: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/clinics/${id}/reset-admin-password`,
        method: "POST",
        body,
      }),
    }),
    extendSubscription: builder.mutation<
      { clinic: Clinic },
      { id: string; plan: "BASIC" | "PRO"; days: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/clinics/${id}/extend`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Clinic", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyClinicQuery,
  useUpdateMyClinicMutation,
  useListAllClinicsQuery,
  useOnboardClinicMutation,
  useSetClinicActiveMutation,
  useUpdateSubscriptionMutation,
  useResetAdminPasswordMutation,
  useExtendSubscriptionMutation,
} = clinicApi;
