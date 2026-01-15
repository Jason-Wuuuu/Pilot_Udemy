// dummy-db/users.js
import bcrypt from "bcryptjs";

export const users = []; // in-memory

export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function findUserById(userId) {
  return users.find(u => u.userId === userId);
}

export async function createUser({ username, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    userId: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    role: role || "user",
  };

  users.push(user);
  return user;
}

export async function updateUser(userId, updates) {
  const user = findUserById(userId);
  if (!user) return null;

  // Only allow updating fields provided
  Object.keys(updates).forEach(key => {
    if (key === "password") {
      user.passwordHash = bcrypt.hashSync(updates.password, 10);
    } else {
      user[key] = updates[key];
    }
  });

  return user;
}

export function deleteUser(userId) {
  const index = users.findIndex(u => u.userId === userId);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}
