import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../repositories/users.js";

export async function registerUser({ username, email, password, role }) {
  if (await findUserByEmail(email)) {
    throw new Error("EMAIL_EXISTS");
  }

  const user = await createUser({ username, email, password, role });
  const token = generateToken(user.userId);

  return { userId: user.userId, token };
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken(user.userId);
  return { user: toPublicUser(user), token };
}

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// utils/user.mapper.js
function toPublicUser(user) {
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage

  };
}
