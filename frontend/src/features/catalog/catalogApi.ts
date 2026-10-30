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
  isActive: boolean;
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
    getProcedures: builder.query<Procedure[], boolean | void>({
      query: (includeInactive) => ({
        url: "/catalog/procedures",
        params: includeInactive ? { includeInactive: "true" } : undefined,
      }),
      transformResponse: (r: ProceduresResponse) => r.procedures,
      providesTags: [{ type: "Procedure", id: "LIST" }],
    }),

    updateCategory: builder.mutation<
      ProcedureCategory,
      { id: string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `/catalog/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (r: CategoryResponse) => r.category,
      invalidatesTags: [{ type: "ProcedureCategory", id: "LIST" }],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/catalog/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "ProcedureCategory", id: "LIST" }],
    }),

    setProcedureActive: builder.mutation<
      Procedure,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/catalog/procedures/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (r: ProcedureResponse) => r.procedure,
      invalidatesTags: [{ type: "Procedure", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProceduresQuery,
  useCreateProcedureMutation,
  useUpdateProcedureMutation,
  useSetProcedureActiveMutation,
} = catalogApi;
