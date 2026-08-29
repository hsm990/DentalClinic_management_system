import AppError from "../../common/AppError";
import todosRepository from "./repository";
import * as httpsStatus from "../../common/httpStatus";

async function listTodos(userId: string, filters: { from?: Date; to?: Date }) {
  return todosRepository.findAll(userId, filters);
}

async function createTodo(userId: string, data: { text: string; date: Date }) {
  return todosRepository.create(userId, data);
}

async function updateTodo(userId: string, id: string, data: any) {
  const updated = await todosRepository.update(userId, id, data);
  if (!updated) throw new AppError("Todo not found", 404, httpsStatus.ERROR);
  return updated;
}

async function deleteTodo(userId: string, id: string) {
  const deleted = await todosRepository.remove(userId, id);
  if (!deleted) throw new AppError("Todo not found", 404, httpsStatus.ERROR);
}

export default { listTodos, createTodo, updateTodo, deleteTodo };
