import { apiFetch } from "./client";
import type { LoginResponse, User } from "../types";

export async function loginAPI(
  username: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getMeAPI(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}
