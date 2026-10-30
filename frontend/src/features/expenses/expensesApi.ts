import { apiSlice } from "@/lib/apiBaseQuery";

export interface Expense {
  id: string;
  category: string;
  amount: string;
  date: string;
  notes?: string | null;
  createdBy?: { id: string; firstName: string; lastName: string } | null;
}

interface ExpensesResponse {
  expenses: Expense[];
}
interface ExpenseResponse {
  expense: Expense;
}

export const expensesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<
      Expense[],
      { from?: string; to?: string } | void
    >({
      query: (args) => ({ url: "/expenses", params: args ?? undefined }),
      transformResponse: (r: ExpensesResponse) => r.expenses,
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Expense" as const, id: e.id })),
              { type: "Expense" as const, id: "LIST" },
            ]
          : [{ type: "Expense", id: "LIST" }],
    }),

    createExpense: builder.mutation<
      Expense,
      { category: string; amount: number; date: string; notes?: string }
    >({
      query: (body) => ({ url: "/expenses", method: "POST", body }),
      transformResponse: (r: ExpenseResponse) => r.expense,
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),

    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
