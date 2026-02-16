import "server-only";

import { parseUserRole, type AuthSession } from "@/app/lib/auth-types";

const DEFAULT_BACKEND_API_BASE_URL = "http://localhost:8000/api/v1";
const AUTH_TOKEN_PATH = "/auth/login/";

export class BackendApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

type LoginCredentials = {
  username: string;
  password: string;
};

function getBackendApiBaseUrl(): string {
  const configuredBaseUrl = process.env.BACKEND_API_BASE_URL?.trim();
  const baseUrl =
    configuredBaseUrl && configuredBaseUrl.length > 0
      ? configuredBaseUrl
      : DEFAULT_BACKEND_API_BASE_URL;

  return baseUrl.replace(/\/+$/, "");
}

function buildBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendApiBaseUrl()}${normalizedPath}`;
}

function extractBackendErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }

  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return null;
}

function parseAuthSession(payload: unknown): AuthSession | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const refreshToken = (payload as { refresh?: unknown }).refresh;
  const accessToken = (payload as { access?: unknown }).access;
  const user = (payload as { user?: unknown }).user;

  if (
    typeof refreshToken !== "string" ||
    refreshToken.length === 0 ||
    typeof accessToken !== "string" ||
    accessToken.length === 0 ||
    !user ||
    typeof user !== "object"
  ) {
    return null;
  }

  const name = (user as { name?: unknown }).name;
  const backendRole = (user as { role?: unknown }).role;
  if (typeof name !== "string" || typeof backendRole !== "string") {
    return null;
  }

  const role = parseUserRole(backendRole);
  if (!role) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    role,
    user: {
      name,
      role,
    },
  };
}

export async function loginWithUsernameAndPassword(
  credentials: LoginCredentials
): Promise<AuthSession> {
  let response: Response;
  try {
    console.log("credentials", credentials);
    console.log("buildBackendUrl(AUTH_TOKEN_PATH)", buildBackendUrl(AUTH_TOKEN_PATH));
    response = await fetch(buildBackendUrl(AUTH_TOKEN_PATH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
  } catch (error) {
    console.error(error);
    throw new BackendApiError(
      "Unable to reach the authentication server. Please try again.",
      0
    );
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new BackendApiError("Invalid username or password.", response.status);
    }

    const backendMessage = extractBackendErrorMessage(payload);
    throw new BackendApiError(
      backendMessage ?? "Unable to sign in right now. Please try again shortly.",
      response.status
    );
  }

  const session = parseAuthSession(payload);
  if (!session) {
    throw new BackendApiError(
      "Authentication succeeded but the response format was unexpected.",
      response.status
    );
  }

  return session;
}
