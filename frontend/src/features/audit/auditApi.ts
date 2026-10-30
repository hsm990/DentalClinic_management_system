import { apiSlice } from "@/lib/apiBaseQuery";

export interface AuditLog {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditLogsResponse,
      { page?: number; entityType?: string } | void
    >({
      query: (args) => ({ url: "/audit-logs", params: args ?? undefined }),
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
