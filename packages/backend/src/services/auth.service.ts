import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { config } from "../config.js";

export async function login(username: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: "30d" as const }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  };
}

export async function getUserById(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}
