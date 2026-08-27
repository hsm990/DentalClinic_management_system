import { apiSlice } from "@/lib/apiBaseQuery";

export type OrthoCaseStatus = "ACTIVE" | "COMPLETED" | "DISCONTINUED";

export interface OrthoVisit {
  id: string;
  visitDate: string;
  notes: string;
  nextVisitDate?: string | null;
  createdBy?: { id: string; firstName: string; lastName: string } | null;
}

export interface OrthoCase {
  id: string;
  applianceType: string;
  startDate: string;
  estimatedEndDate?: string | null;
  status: OrthoCaseStatus;
  notes?: string | null;
  patientId: string;
  dentist: { id: string; firstName: string; lastName: string };
  createdBy?: { id: string; firstName: string; lastName: string } | null;
  visits: OrthoVisit[];
}

interface CasesResponse {
  cases: OrthoCase[];
}
interface CaseResponse {
  case: OrthoCase;
}
interface VisitResponse {
  visit: OrthoVisit;
}

export const orthodonticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrthoCases: builder.query<OrthoCase[], string>({
      query: (patientId) => `/patients/${patientId}/orthodontic-cases`,
      transformResponse: (r: CasesResponse) => r.cases,
      providesTags: (_r, _e, patientId) => [
        { type: "OrthoCase", id: patientId },
      ],
    }),

    createOrthoCase: builder.mutation<
      OrthoCase,
      {
        patientId: string;
        applianceType: string;
        startDate: string;
        estimatedEndDate?: string;
        dentistId: string;
        notes?: string;
      }
    >({
      query: ({ patientId, ...body }) => ({
        url: `/patients/${patientId}/orthodontic-cases`,
        method: "POST",
        body,
      }),
      transformResponse: (r: CaseResponse) => r.case,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "OrthoCase", id: patientId },
      ],
    }),

    updateOrthoCaseStatus: builder.mutation<
      OrthoCase,
      { caseId: string; patientId: string; status: OrthoCaseStatus }
    >({
      query: ({ caseId, status }) => ({
        url: `/orthodontic-cases/${caseId}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: CaseResponse) => r.case,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "OrthoCase", id: patientId },
      ],
    }),

    addOrthoVisit: builder.mutation<
      OrthoVisit,
      {
        caseId: string;
        patientId: string;
        visitDate?: string;
        notes: string;
        nextVisitDate?: string;
      }
    >({
      query: ({ caseId, patientId: _patientId, ...body }) => ({
        url: `/orthodontic-cases/${caseId}/visits`,
        method: "POST",
        body,
      }),
      transformResponse: (r: VisitResponse) => r.visit,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "OrthoCase", id: patientId },
      ],
    }),
  }),
});

export const {
  useGetOrthoCasesQuery,
  useCreateOrthoCaseMutation,
  useUpdateOrthoCaseStatusMutation,
  useAddOrthoVisitMutation,
} = orthodonticsApi;
