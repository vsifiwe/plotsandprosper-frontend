export type UserRole = "admin" | "member";

export type AuthUser = {
  name: string;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  role: UserRole;
};

export function parseUserRole(value: string): UserRole | null {
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "admin" || normalizedValue === "member") {
    return normalizedValue;
  }

  return null;
}
