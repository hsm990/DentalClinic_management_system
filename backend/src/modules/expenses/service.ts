import AppError from "../../common/AppError";
import { logAudit } from "../../common/auditLog";
import expensesRepository from "./repository";
import * as httpsStatus from "../../common/httpStatus";

interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}

function requireClinicId(user: RequestingUser) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return user.clinicId;
}

async function listExpenses(
  user: RequestingUser,
  filters: { from?: Date; to?: Date },
) {
  return expensesRepository.findAll(requireClinicId(user), filters);
}

async function createExpense(user: RequestingUser, data: any) {
  const clinicId = requireClinicId(user);
  const expense = await expensesRepository.create(clinicId, user.id, data);
  await logAudit({
    clinicId,
    userId: user.id,
    action: "CREATE",
    entityType: "Expense",
    entityId: expense.id,
    summary: `Added expense: ${expense.category} — $${expense.amount}`,
  });
  return expense;
}

async function updateExpense(user: RequestingUser, id: string, data: any) {
  const updated = await expensesRepository.update(
    requireClinicId(user),
    id,
    data,
  );
  if (!updated) throw new AppError("Expense not found", 404, httpsStatus.ERROR);
  return updated;
}

async function deleteExpense(user: RequestingUser, id: string) {
  const clinicId = requireClinicId(user);
  const deleted = await expensesRepository.remove(clinicId, id);
  if (!deleted) throw new AppError("Expense not found", 404, httpsStatus.ERROR);
  await logAudit({
    clinicId,
    userId: user.id,
    action: "DELETE",
    entityType: "Expense",
    entityId: id,
    summary: `Deleted an expense`,
  });
}

export default { listExpenses, createExpense, updateExpense, deleteExpense };
