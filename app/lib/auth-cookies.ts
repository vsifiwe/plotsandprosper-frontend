import "server-only";

import { cookies } from "next/headers";

import { parseUserRole, type AuthSession, type UserRole } from "@/app/lib/auth-types";

export const AUTH_ACCESS_TOKEN_COOKIE = "pp_access_token";
export const AUTH_REFRESH_TOKEN_COOKIE = "pp_refresh_token";
export const AUTH_USER_NAME_COOKIE = "pp_user_name";
export const AUTH_USER_ROLE_COOKIE = "pp_user_role";

type PersistedAuthSession = {
  accessToken: string;
  refreshToken: string;
  userName: string;
  role: UserRole;
};

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function setAuthCookies(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  const options = getCookieOptions();

  cookieStore.set(AUTH_ACCESS_TOKEN_COOKIE, session.accessToken, options);
  cookieStore.set(AUTH_REFRESH_TOKEN_COOKIE, session.refreshToken, options);
  cookieStore.set(AUTH_USER_NAME_COOKIE, session.user.name, options);
  cookieStore.set(AUTH_USER_ROLE_COOKIE, session.role, options);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(AUTH_REFRESH_TOKEN_COOKIE);
  cookieStore.delete(AUTH_USER_NAME_COOKIE);
  cookieStore.delete(AUTH_USER_ROLE_COOKIE);
}

export async function getAuthSessionFromCookies(): Promise<PersistedAuthSession | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(AUTH_REFRESH_TOKEN_COOKIE)?.value;
  const userName = cookieStore.get(AUTH_USER_NAME_COOKIE)?.value;
  const roleValue = cookieStore.get(AUTH_USER_ROLE_COOKIE)?.value;

  if (!accessToken || !roleValue) {
    return null;
  }

  const role = parseUserRole(roleValue);
  if (!role) {
    return null;
  }

  return {
    accessToken,
    refreshToken: refreshToken ?? "",
    userName: userName ?? "",
    role,
  };
}
