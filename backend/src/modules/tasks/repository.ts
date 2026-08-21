import prisma from "../../config/prisma";

interface RequestingUser {
  id: string;
  role: string;
}

const userInclude = {
  select: { id: true, firstName: true, lastName: true, role: true },
};

// visible = assigned to me directly, assigned to my role, assigned to
// the whole clinic, OR I created it (so creators can always track their own)
function findVisible(clinicId: string, user: RequestingUser) {
  return prisma.task.findMany({
    where: {
      clinicId,
      OR: [
        { targetType: "CLINIC" },
        { targetType: "ROLE", targetRole: user.role as any },
        { targetType: "USER", targetUserId: user.id },
        { createdById: user.id },
      ],
    },
    include: { createdBy: userInclude, targetUser: userInclude },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
}

function create(clinicId: string, createdById: string, data: any) {
  return prisma.task.create({
    data: { ...data, clinicId, createdById },
    include: { createdBy: userInclude, targetUser: userInclude },
  });
}

function findById(clinicId: string, id: string) {
  return prisma.task.findFirst({ where: { id, clinicId } });
}

function updateStatus(id: string, status: string) {
  return prisma.task.update({
    where: { id },
    data: { status: status as any },
    include: { createdBy: userInclude, targetUser: userInclude },
  });
}

function remove(id: string) {
  return prisma.task.delete({ where: { id } });
}

export default { findVisible, create, findById, updateStatus, remove };
