import "server-only";

import { redirect } from "next/navigation";

import { getAuthSessionFromCookies } from "@/app/lib/auth-cookies";
import type { AuthSession, UserRole } from "@/app/lib/auth-types";
export type { AuthSession, UserRole } from "@/app/lib/auth-types";

const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  member: "/member/dashboard",
};

function getTokenExpirationInMilliseconds(token: string): number | null {
  const tokenParts = token.split(".");
  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(tokenParts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as { exp?: unknown };
    if (typeof payload.exp !== "number") {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function getDashboardPathByRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATH[role];
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const persistedSession = await getAuthSessionFromCookies();
  if (!persistedSession) {
    return null;
  }

  const accessTokenExpiration = getTokenExpirationInMilliseconds(
    persistedSession.accessToken
  );
  if (accessTokenExpiration !== null && accessTokenExpiration <= Date.now()) {
    return null;
  }

  return {
    accessToken: persistedSession.accessToken,
    refreshToken: persistedSession.refreshToken,
    role: persistedSession.role,
    user: {
      name: persistedSession.userName,
      email: persistedSession.userEmail,
      role: persistedSession.role,
    },
  };
}

export async function requireRole(role: UserRole): Promise<AuthSession> {
  return requireRoles([role]);
}

export async function requireRoles(roles: UserRole[]): Promise<AuthSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth");
  }

  if (!roles.includes(session.role)) {
    redirect("/forbidden");
  }

  return session;
}
