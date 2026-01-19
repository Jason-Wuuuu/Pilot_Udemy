import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../repositories/users.repo.js";

export async function registerUser({ username, email, password, role }) {
  if (await findUserByEmail(email)) {
    throw new Error("EMAIL_EXISTS");
  }

  const normalizedRole =
    role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "STUDENT";

  const user = await createUser({
    username,
    email,
    password,
    role: normalizedRole,
  });
  const token = generateToken(user.userId);

  return { userId: user.userId, token };
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken(user.userId);
  return { userId: user.userId, token };
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
