import { apiSlice } from "../../lib/apiBaseQuery";

export type PlanItemStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface TreatmentPlanItem {
  id: string;
  toothNumber?: number | null;
  status: PlanItemStatus;
  estimatedCost: string;
  notes?: string | null;
  procedureId: string;
  procedure: { id: string; name: string; price: string };
}

export interface TreatmentPlan {
  id: string;
  title: string;
  notes?: string | null;
  patientId: string;
  items: TreatmentPlanItem[];
}

interface PlansResponse {
  plans: TreatmentPlan[];
}
interface PlanResponse {
  plan: TreatmentPlan;
}
interface ItemResponse {
  item: TreatmentPlanItem;
}

export const treatmentPlansApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTreatmentPlans: builder.query<TreatmentPlan[], string>({
      query: (patientId) => `/patients/${patientId}/treatment-plans`,
      transformResponse: (r: PlansResponse) => r.plans,
      providesTags: (_r, _e, patientId) => [
        { type: "TreatmentPlan", id: patientId },
      ],
    }),

    createTreatmentPlan: builder.mutation<
      TreatmentPlan,
      { patientId: string; title: string; notes?: string }
    >({
      query: ({ patientId, ...body }) => ({
        url: `/patients/${patientId}/treatment-plans`,
        method: "POST",
        body,
      }),
      transformResponse: (r: PlanResponse) => r.plan,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "TreatmentPlan", id: patientId },
      ],
    }),

    addPlanItem: builder.mutation<
      TreatmentPlanItem,
      {
        planId: string;
        patientId: string;
        procedureId: string;
        toothNumber?: number;
        estimatedCost: number;
        notes?: string;
      }
    >({
      query: ({ planId, patientId, ...body }) => ({
        url: `/treatment-plans/${planId}/items`,
        method: "POST",
        body,
      }),
      transformResponse: (r: ItemResponse) => r.item,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "TreatmentPlan", id: patientId },
      ],
    }),

    updatePlanItemStatus: builder.mutation<
      TreatmentPlanItem,
      { itemId: string; patientId: string; status: PlanItemStatus }
    >({
      query: ({ itemId, status }) => ({
        url: `/treatment-plan-items/${itemId}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: ItemResponse) => r.item,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "TreatmentPlan", id: patientId },
      ],
    }),
  }),
});

export const {
  useGetTreatmentPlansQuery,
  useCreateTreatmentPlanMutation,
  useAddPlanItemMutation,
  useUpdatePlanItemStatusMutation,
} = treatmentPlansApi;
