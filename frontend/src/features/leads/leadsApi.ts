import { apiSlice } from "@/lib/apiBaseQuery";
export type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "DECLINED";

export interface Lead {
  id: string;
  clinicName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: LeadStatus;
  createdAt: string;
}
export const leadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLead: builder.mutation<
      { id: string },
      {
        clinicName: string;
        contactName: string;
        email: string;
        phone?: string;
        message?: string;
      }
    >({
      query: (body) => ({ url: "/leads", method: "POST", body }),
    }),
    getLeads: builder.query<Lead[], void>({
      query: () => "/leads",
      transformResponse: (r: { leads: Lead[] }) => r.leads,
      providesTags: [{ type: "Lead", id: "LIST" }],
    }),

    updateLeadStatus: builder.mutation<
      Lead,
      { id: string; status: LeadStatus }
    >({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: { lead: Lead }) => r.lead,
      invalidatesTags: [{ type: "Lead", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateLeadMutation,
  useGetLeadsQuery,
  useUpdateLeadStatusMutation,
} = leadsApi;
