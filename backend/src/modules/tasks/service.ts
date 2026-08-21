import AppError from "../../common/AppError";
import tasksRepository from "./repository";
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

async function listTasks(user: RequestingUser) {
  return tasksRepository.findVisible(requireClinicId(user), user);
}

async function createTask(user: RequestingUser, data: any) {
  return tasksRepository.create(requireClinicId(user), user.id, data);
}

// anyone the task is actually visible to can update its status — a shared
// clinic-wide or role-wide task is meant to be markable by whoever does it,
// not locked to a single person
async function updateTaskStatus(
  user: RequestingUser,
  taskId: string,
  status: string,
) {
  const clinicId = requireClinicId(user);
  const task = await tasksRepository.findById(clinicId, taskId);
  if (!task) throw new AppError("Task not found", 404, httpsStatus.ERROR);

  const canUpdate =
    task.createdById === user.id ||
    (task.targetType === "USER" && task.targetUserId === user.id) ||
    (task.targetType === "ROLE" && task.targetRole === user.role) ||
    task.targetType === "CLINIC";

  if (!canUpdate)
    throw new AppError("You cannot update this task", 403, httpsStatus.ERROR);

  return tasksRepository.updateStatus(taskId, status);
}

async function deleteTask(user: RequestingUser, taskId: string) {
  const clinicId = requireClinicId(user);
  const task = await tasksRepository.findById(clinicId, taskId);
  if (!task) throw new AppError("Task not found", 404, httpsStatus.ERROR);

  // only the creator (or an admin) can delete — anyone assigned can complete
  // it, but shouldn't be able to erase a task someone else gave them
  if (task.createdById !== user.id && user.role !== "ADMIN") {
    throw new AppError(
      "Only the creator or an admin can delete this task",
      403,
      httpsStatus.ERROR,
    );
  }

  await tasksRepository.remove(taskId);
}

export default { listTasks, createTask, updateTaskStatus, deleteTask };
