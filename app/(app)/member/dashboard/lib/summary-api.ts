import "server-only";

import { requireRole } from "@/app/lib/auth";
import { buildBackendUrl, extractErrorMessage } from "@/app/lib/server-api-utils";

import type { MemberSummary, SummaryMetric } from "../types";

export class SummaryApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SummaryApiError";
    this.status = status;
  }
}


function isValidMetric(value: unknown): value is SummaryMetric {
  if (!value || typeof value !== "object") return false;
  const metric = value as Partial<SummaryMetric>;
  return typeof metric.amount === "string" && typeof metric.growth === "string";
}

function parseMemberSummary(payload: unknown): MemberSummary | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  if (
    !isValidMetric(raw.lifetime) ||
    !isValidMetric(raw.group) ||
    !isValidMetric(raw.membership) ||
    !isValidMetric(raw.investment)
  ) {
    return null;
  }

  return {
    lifetime: raw.lifetime,
    group: raw.group,
    membership: raw.membership,
    investment: raw.investment,
  };
}

export async function fetchMemberSummary(): Promise<MemberSummary> {
  const session = await requireRole("member");

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/members/me/statement/summary/"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new SummaryApiError(
      "Unable to reach the summary service. Please try again.",
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
      throw new SummaryApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new SummaryApiError(
      backendMessage ?? "Unable to load summary at the moment.",
      response.status
    );
  }

  const summary = parseMemberSummary(payload);
  if (!summary) {
    throw new SummaryApiError(
      "Summary response format is invalid.",
      response.status
    );
  }

  return summary;
}
