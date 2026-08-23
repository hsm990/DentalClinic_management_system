import { apiSlice } from "@/lib/apiBaseQuery";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";
export type TaskTargetType = "USER" | "ROLE" | "CLINIC";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: TaskStatus;
  targetType: TaskTargetType;
  targetUserId?: string | null;
  targetRole?: string | null;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string; role: string };
  targetUser?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  createdAt: string;
}

interface TasksResponse {
  tasks: Task[];
}
interface TaskResponse {
  task: Task;
}

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => "/tasks",
      transformResponse: (r: TasksResponse) => r.tasks,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Task" as const, id: t.id })),
              { type: "Task" as const, id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    createTask: builder.mutation<Task, Record<string, unknown>>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      transformResponse: (r: TaskResponse) => r.task,
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTaskStatus: builder.mutation<
      Task,
      { id: string; status: TaskStatus }
    >({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: TaskResponse) => r.task,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = tasksApi;
