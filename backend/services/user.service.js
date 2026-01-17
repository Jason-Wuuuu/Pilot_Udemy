import { updateUser, deleteUser } from "../repositories/users.js";

export async function updateCurrentUser(userId, targetUserId, data) {
  if (userId !== targetUserId) {
    throw new Error("FORBIDDEN");
  }

  const user = await updateUser(targetUserId, data);
  if (!user) throw new Error("NOT_FOUND");

  return user;
}

export async function deleteCurrentUser(userId, targetUserId) {
  if (userId !== targetUserId) {
    throw new Error("FORBIDDEN");
  }

  const deleted = await deleteUser(targetUserId);
  if (!deleted) throw new Error("NOT_FOUND");
}
