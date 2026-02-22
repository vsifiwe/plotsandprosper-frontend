import "server-only";

import { requireRole } from "@/app/lib/auth";

const DEFAULT_ANALYTICS_ENDPOINT = "http://localhost:8000/api/v1/analytics/";

export type DashboardAnalytics = {
  memberCount: number;
  totalContributions: string;
  totalInvestments: number;
  growthRate: number;
};

export class AnalyticsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AnalyticsApiError";
    this.status = status;
  }
}

function getAnalyticsEndpoint(): string {
  const configuredEndpoint = process.env.BACKEND_ANALYTICS_ENDPOINT?.trim();
  if (configuredEndpoint && configuredEndpoint.length > 0) {
    return configuredEndpoint;
  }

  return DEFAULT_ANALYTICS_ENDPOINT;
}

function parseDashboardAnalytics(payload: unknown): DashboardAnalytics | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Partial<DashboardAnalytics>;
  if (
    typeof data.memberCount !== "number" ||
    typeof data.totalContributions !== "string" ||
    typeof data.totalInvestments !== "number" ||
    typeof data.growthRate !== "number"
  ) {
    return null;
  }

  return {
    memberCount: data.memberCount,
    totalContributions: data.totalContributions,
    totalInvestments: data.totalInvestments,
    growthRate: data.growthRate,
  };
}

function extractErrorMessage(payload: unknown): string | null {
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

export async function fetchAdminDashboardAnalytics(): Promise<DashboardAnalytics> {
  const session = await requireRole("admin");

  let response: Response;
  try {
    response = await fetch(getAnalyticsEndpoint(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new AnalyticsApiError(
      "Unable to reach the analytics service. Please try again.",
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
    if (response.status === 401 || response.status === 403) {
      throw new AnalyticsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new AnalyticsApiError(
      backendMessage ?? "Unable to load dashboard analytics at the moment.",
      response.status
    );
  }

  const analytics = parseDashboardAnalytics(payload);
  if (!analytics) {
    throw new AnalyticsApiError(
      "Dashboard analytics response format is invalid.",
      response.status
    );
  }

  return analytics;
}
