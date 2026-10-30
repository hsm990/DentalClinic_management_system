import prisma from "../../config/prisma";

async function createLead(data: any) {
  return prisma.lead.create({ data });
}

async function listLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}
async function updateLeadStatus(id: string, status: string) {
  return prisma.lead.update({ where: { id }, data: { status: status as any } });
}
export default { createLead, listLeads, updateLeadStatus };
