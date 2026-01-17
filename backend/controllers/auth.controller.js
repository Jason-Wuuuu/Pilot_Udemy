// controllers/auth.controller.js
import dotenv from "dotenv";
import { registerUser, loginUser } from "../services/auth.service.js";

dotenv.config();

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    // HTTP-level validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required"
      });
    }

    const { userId, token } = await registerUser({
      username,
      email,
      password,
      role
    });

    res.status(201).json({
      message: "User created",
      userId,
      token
    });
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // HTTP-level validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const { userId, token } = await loginUser({ email, password });

    res.json({
      message: "Login successful",
      userId,
      token
    });
  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
