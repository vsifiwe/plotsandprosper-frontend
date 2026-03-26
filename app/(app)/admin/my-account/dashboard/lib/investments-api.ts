import "server-only";

import { requireRole } from "@/app/lib/auth";
import { buildBackendUrl, extractErrorMessage } from "@/app/lib/server-api-utils";

import type { Investment } from "../types";

export class InvestmentsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "InvestmentsApiError";
    this.status = status;
  }
}

function parseInvestment(payload: unknown): Investment | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  if (
    typeof raw.id !== "number" ||
    typeof raw.name !== "string" ||
    typeof raw.vehicle_type !== "string" ||
    typeof raw.current_value !== "string" ||
    typeof raw.description !== "string"
  ) {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    vehicleType: raw.vehicle_type as Investment["vehicleType"],
    currentValue: raw.current_value,
    description: raw.description,
  };
}

function parseInvestments(payload: unknown): Investment[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const investments: Investment[] = [];
  for (const item of payload) {
    const investment = parseInvestment(item);
    if (!investment) {
      return null;
    }
    investments.push(investment);
  }

  return investments;
}

export async function fetchAdminPersonalInvestments(): Promise<Investment[]> {
  const session = await requireRole("admin");

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/members/me/statement/investments/"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new InvestmentsApiError(
      "Unable to reach the investments service. Please try again.",
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
      throw new InvestmentsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new InvestmentsApiError(
      backendMessage ?? "Unable to load investments at the moment.",
      response.status
    );
  }

  const investments = parseInvestments(payload);
  if (!investments) {
    throw new InvestmentsApiError(
      "Investments response format is invalid.",
      response.status
    );
  }

  return investments;
}
