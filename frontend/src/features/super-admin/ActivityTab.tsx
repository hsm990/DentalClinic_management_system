import { format } from "date-fns";
import { useGetPlatformAuditLogsQuery } from "@/features/audit/auditApi";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function ActivityTab() {
  const { data, isLoading } = useGetPlatformAuditLogsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>What</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.logs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                Nothing yet.
              </TableCell>
            </TableRow>
          )}
          {data?.logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(log.createdAt), "MMM d, h:mm a")}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{log.action}</Badge>
              </TableCell>
              <TableCell className="text-sm">{log.summary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
