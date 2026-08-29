import { apiSlice } from "@/lib/apiBaseQuery";

export interface PersonalTodo {
  id: string;
  text: string;
  date: string;
  isDone: boolean;
}

interface TodosResponse {
  todos: PersonalTodo[];
}
interface TodoResponse {
  todo: PersonalTodo;
}

export const todosApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query<
      PersonalTodo[],
      { from?: string; to?: string } | void
    >({
      query: (args) => ({ url: "/todos", params: args ?? undefined }),
      transformResponse: (r: TodosResponse) => r.todos,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Todo" as const, id: t.id })),
              { type: "Todo" as const, id: "LIST" },
            ]
          : [{ type: "Todo", id: "LIST" }],
    }),

    createTodo: builder.mutation<PersonalTodo, { text: string; date: string }>({
      query: (body) => ({ url: "/todos", method: "POST", body }),
      transformResponse: (r: TodoResponse) => r.todo,
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),

    updateTodo: builder.mutation<
      PersonalTodo,
      { id: string; data: { text?: string; isDone?: boolean } }
    >({
      query: ({ id, data }) => ({
        url: `/todos/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (r: TodoResponse) => r.todo,
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),

    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({ url: `/todos/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todosApi;
