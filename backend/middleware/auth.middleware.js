// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserById } from "../dummy-db/users.js";

dotenv.config();

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(decoded.userId);
    if (!user) throw new Error();
    req.user = user; // attach current user to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
