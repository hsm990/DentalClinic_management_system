// src/features/catalog/catalogApi.ts
import { apiSlice } from "@/lib/apiBaseQuery";

export interface ProcedureCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Procedure {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  durationMin: number;
  categoryId: string;
  category: ProcedureCategory;
}

interface CategoriesResponse {
  list: ProcedureCategory[];
}
interface ProceduresResponse {
  procedures: Procedure[];
}
interface CategoryResponse {
  category: ProcedureCategory;
}
interface ProcedureResponse {
  procedure: Procedure;
}

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ProcedureCategory[], void>({
      query: () => "/catalog/categories",
      transformResponse: (r: CategoriesResponse) => r.list,
      providesTags: [{ type: "ProcedureCategory", id: "LIST" }],
    }),

    createCategory: builder.mutation<
      ProcedureCategory,
      { name: string; sortOrder?: number }
    >({
      query: (body) => ({ url: "/catalog/categories", method: "POST", body }),
      transformResponse: (r: CategoryResponse) => r.category,
      invalidatesTags: [{ type: "ProcedureCategory", id: "LIST" }],
    }),

    getProcedures: builder.query<Procedure[], void>({
      query: () => "/catalog/procedures",
      transformResponse: (r: ProceduresResponse) => r.procedures,
      providesTags: [{ type: "Procedure", id: "LIST" }],
    }),

    createProcedure: builder.mutation<
      Procedure,
      {
        name: string;
        price: number;
        durationMin?: number;
        categoryId: string;
        description?: string;
      }
    >({
      query: (body) => ({ url: "/catalog/procedures", method: "POST", body }),
      transformResponse: (r: ProcedureResponse) => r.procedure,
      invalidatesTags: [{ type: "Procedure", id: "LIST" }],
    }),

    updateProcedure: builder.mutation<
      Procedure,
      { id: string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `/catalog/procedures/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (r: ProcedureResponse) => r.procedure,
      invalidatesTags: [{ type: "Procedure", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetProceduresQuery,
  useCreateProcedureMutation,
  useUpdateProcedureMutation,
} = catalogApi;
