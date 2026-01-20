// src/utils/normalizeUser.ts
import type { User } from "../store/slices/authSlice";

export function normalizeUser(apiUser: any): User {
  return {
    id: apiUser.userId,
    username: apiUser.username,
    email: apiUser.email,
    role: apiUser.role,
    profileImage: apiUser.profileImage,
  };
}
