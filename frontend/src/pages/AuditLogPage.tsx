import { useState } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { useAppSelector } from "@/app/hooks";
import { useGetAuditLogsQuery } from "@/features/audit/auditApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const ACTION_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  STATUS_CHANGE: "outline",
  DELETE: "destructive",
};

export function AuditLogPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAuditLogsQuery({ page });

  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Who did what, and when</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>What</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {data?.logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(log.createdAt), "MMM d, h:mm a")}
                </TableCell>
                <TableCell className="text-sm">
                  {log.user
                    ? `${log.user.firstName} ${log.user.lastName}`
                    : "System"}
                </TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANT[log.action]}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{log.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
