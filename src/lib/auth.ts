import { apiFetch } from "@/lib/api";

export const logout = async (): Promise<void> => {
  try {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore logout errors.
  }
};
