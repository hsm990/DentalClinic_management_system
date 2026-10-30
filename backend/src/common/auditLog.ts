import prisma from "../config/prisma";

interface LogAuditParams {
  clinicId: string;
  userId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

// fire-and-forget by design: an audit log failure should never block the
// actual business operation it's recording. Logged to console if it fails,
// never thrown.
export async function logAudit(params: LogAuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        clinicId: params.clinicId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        summary: params.summary,
        metadata: params.metadata as any,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
