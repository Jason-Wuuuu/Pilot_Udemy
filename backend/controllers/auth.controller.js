// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { findUserByEmail, createUser } from "../db/users.js";

dotenv.config();

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

// POST /api/auth/register
export async function register(req, res) {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }

  if (await findUserByEmail(email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const user = await createUser({ username, email, password, role });
  const token = generateToken(user.userId);

  res.status(201).json({ message: "User created", userId: user.userId, token });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.userId);
  res.json({ message: "Login successful", userId: user.userId, token });
}
