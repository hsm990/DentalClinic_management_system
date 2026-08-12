import { apiSlice } from "../../lib/apiBaseQuery";

export type ToothCondition =
  | "HEALTHY"
  | "DECAYED"
  | "FILLED"
  | "CROWNED"
  | "ROOT_CANAL"
  | "MISSING"
  | "IMPLANT"
  | "FRACTURED"
  | "IMPACTED";

export interface ToothChartEntry {
  id: string;
  toothNumber: number;
  condition: ToothCondition;
  notes?: string | null;
  patientId: string;
}

interface ChartResponse {
  chart: ToothChartEntry[];
}
interface EntryResponse {
  entry: ToothChartEntry;
}

export const toothChartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getToothChart: builder.query<ToothChartEntry[], string>({
      query: (patientId) => `/patients/${patientId}/tooth-chart`,
      transformResponse: (r: ChartResponse) => r.chart,
      providesTags: (_r, _e, patientId) => [
        { type: "ToothChart", id: patientId },
      ],
    }),

    upsertTooth: builder.mutation<
      ToothChartEntry,
      {
        patientId: string;
        toothNumber: number;
        condition: ToothCondition;
        notes?: string;
      }
    >({
      query: ({ patientId, toothNumber, ...body }) => ({
        url: `/patients/${patientId}/tooth-chart/${toothNumber}`,
        method: "PUT",
        body,
      }),
      transformResponse: (r: EntryResponse) => r.entry,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "ToothChart", id: patientId },
      ],
    }),
  }),
});

export const { useGetToothChartQuery, useUpsertToothMutation } = toothChartApi;
