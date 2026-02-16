export type UserRole = "admin" | "member";
export type TokenType = "Bearer";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
};

export type AuthSession = {
  tokenType: TokenType;
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: UserRole;
  scope: string[];
  expiresAt: string;
};

export const authUsers: AuthUser[] = [
  {
    id: "u_admin_001",
    fullName: "Admin User",
    email: "admin@plotsandprosper.com",
    password: "Admin@123",
    role: "admin",
    isActive: true,
  },
  {
    id: "u_member_001",
    fullName: "Member User",
    email: "member@plotsandprosper.com",
    password: "Member@123",
    role: "member",
    isActive: true,
  },
];

export const authSessions: AuthSession[] = [
  {
    tokenType: "Bearer",
    accessToken: "mock_access_token_admin_001",
    refreshToken: "mock_refresh_token_admin_001",
    userId: "u_admin_001",
    role: "admin",
    scope: ["admin:read", "admin:write"],
    expiresAt: "2026-12-31T23:59:59.000Z",
  },
  {
    tokenType: "Bearer",
    accessToken: "mock_access_token_member_001",
    refreshToken: "mock_refresh_token_member_001",
    userId: "u_member_001",
    role: "member",
    scope: ["member:read"],
    expiresAt: "2026-12-31T23:59:59.000Z",
  },
];

export const authTestCredentials = {
  admin: {
    email: "admin@plotsandprosper.com",
    password: "Admin@123",
  },
  member: {
    email: "member@plotsandprosper.com",
    password: "Member@123",
  },
};

export function getAuthorizationHeader(session: AuthSession): string {
  return `${session.tokenType} ${session.accessToken}`;
}

export function findUserByEmail(email: string): AuthUser | null {
  return (
    authUsers.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase()
    ) ?? null
  );
}

export function authenticateUser(
  email: string,
  password: string
): AuthSession | null {
  const user = findUserByEmail(email);
  if (!user || !user.isActive) {
    return null;
  }

  if (user.password !== password) {
    return null;
  }

  return authSessions.find((session) => session.userId === user.id) ?? null;
}
