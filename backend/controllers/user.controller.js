// controllers/user.controller.js
import {
  updateCurrentUser as updateCurrentUserService,
  deleteCurrentUser as deleteCurrentUserService
} from "../services/user.service.js";

// GET /api/users/me
export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

// PATCH /api/users/:id
export async function updateCurrentUser(req, res) {
  try {
    const user = await updateCurrentUserService(
      req.user.userId,   // authenticated user
      req.params.id,     // target user
      req.body
    );

    res.json({
      message: "User updated",
      user
    });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    console.error("Update user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/users/:id
export async function deleteCurrentUser(req, res) {
  try {
    await deleteCurrentUserService(
      req.user.userId,   // authenticated user
      req.params.id      // target user
    );

    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    console.error("Delete user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
