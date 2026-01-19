// routes/user.routes.js
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authenticate, getCurrentUser);
router.patch("/:id", authenticate, updateCurrentUser);
router.delete("/:id", authenticate, deleteCurrentUser);

export default router;