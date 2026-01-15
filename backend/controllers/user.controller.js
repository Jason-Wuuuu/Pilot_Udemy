// controllers/user.controller.js
import { findUserById, updateUser, deleteUser } from "../dummy-db/users.js";

// GET /api/users/me
export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

// PATCH /api/users/:id
export async function updateCurrentUser(req, res) {
  const { id } = req.params;
  if (id !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

  const updatedUser = await updateUser(id, req.body);
  if (!updatedUser) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User updated", user: updatedUser });
}

// DELETE /api/users/:id
export function deleteCurrentUser(req, res) {
  const { id } = req.params;
  if (id !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

  const deleted = deleteUser(id);
  if (!deleted) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User deleted" });
}
