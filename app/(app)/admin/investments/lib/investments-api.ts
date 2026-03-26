import "server-only";

import { requireRole } from "@/app/lib/auth";
import { buildBackendUrl, extractErrorMessage } from "@/app/lib/server-api-utils";

import {
  type CreateInvestmentInput,
  type InvestFundsInput,
  type Investment,
  type PaginatedInvestments,
  type ReallocateFundsInput,
} from "../types";
export const ADMIN_INVESTMENTS_PAGE_SIZE = 10;

type BackendInvestment = {
  id: number;
  name: string;
  vehicle_type: string;
  current_value: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type CreateBackendInvestmentPayload = {
  name: string;
  vehicle_type: string;
  description: string;
};

export class InvestmentsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "InvestmentsApiError";
    this.status = status;
  }
}

function createAdminInvestmentsUrl(page: number): string {
  const endpoint = buildBackendUrl("/investment-accounts/");
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const url = new URL(endpoint);
  url.searchParams.set("page", String(safePage));
  url.searchParams.set("page_size", String(ADMIN_INVESTMENTS_PAGE_SIZE));
  return url.toString();
}

function parseBackendInvestment(payload: unknown): Investment | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const backendInvestment = payload as Partial<BackendInvestment>;
  if (
    typeof backendInvestment.id !== "number" ||
    typeof backendInvestment.name !== "string" ||
    typeof backendInvestment.vehicle_type !== "string" ||
    typeof backendInvestment.description !== "string" ||
    typeof backendInvestment.current_value !== "string" ||
    typeof backendInvestment.created_at !== "string" ||
    typeof backendInvestment.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: backendInvestment.id,
    name: backendInvestment.name,
    vehicleType: backendInvestment.vehicle_type,
    currentValue: backendInvestment.current_value,
    description: backendInvestment.description,
    createdAt: backendInvestment.created_at,
    updatedAt: backendInvestment.updated_at,
  };
}

function parseInvestments(payload: unknown): Investment[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const investments: Investment[] = [];
  for (const item of payload) {
    const investment = parseBackendInvestment(item);
    if (!investment) {
      return null;
    }

    investments.push(investment);
  }

  return investments;
}

function parsePaginatedInvestments(payload: unknown): PaginatedInvestments | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const backendPaginatedInvestments = payload as {
    count?: unknown;
    next?: unknown;
    previous?: unknown;
    results?: unknown;
  };

  if (
    typeof backendPaginatedInvestments.count !== "number" ||
    backendPaginatedInvestments.count < 0 ||
    !Number.isFinite(backendPaginatedInvestments.count) ||
    (backendPaginatedInvestments.next !== null &&
      typeof backendPaginatedInvestments.next !== "string") ||
    (backendPaginatedInvestments.previous !== null &&
      typeof backendPaginatedInvestments.previous !== "string")
  ) {
    return null;
  }

  const results = parseInvestments(backendPaginatedInvestments.results);
  if (!results) {
    return null;
  }

  return {
    count: backendPaginatedInvestments.count,
    next: backendPaginatedInvestments.next,
    previous: backendPaginatedInvestments.previous,
    results,
  };
}

function mapCreateInvestmentInputToPayload(
  input: CreateInvestmentInput
): CreateBackendInvestmentPayload {
  return {
    name: input.name,
    vehicle_type: input.vehicleType,
    description: input.description,
  };
}

export async function fetchAdminInvestments(page = 1): Promise<PaginatedInvestments> {
  const session = await requireRole("admin");

  console.log("createAdminInvestmentsUrl", createAdminInvestmentsUrl(page));

  let response: Response;
  try {
    response = await fetch(createAdminInvestmentsUrl(page), {
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

  const investmentsPage = parsePaginatedInvestments(payload);
  if (!investmentsPage) {
    throw new InvestmentsApiError(
      "Investments response format is invalid.",
      response.status
    );
  }

  return investmentsPage;
}

export async function createAdminInvestment(
  input: CreateInvestmentInput
): Promise<Investment> {
  const session = await requireRole("admin");
  const payload = mapCreateInvestmentInputToPayload(input);

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/investment-accounts/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new InvestmentsApiError(
      "Unable to reach the investments service. Please try again.",
      0
    );
  }

  let responsePayload: unknown = null;
  try {
    responsePayload = await response.json();
  } catch {
    responsePayload = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new InvestmentsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(responsePayload);
    throw new InvestmentsApiError(
      backendMessage ?? "Unable to create investment at the moment.",
      response.status
    );
  }

  const createdInvestment = parseBackendInvestment(responsePayload);
  if (!createdInvestment) {
    throw new InvestmentsApiError(
      "Create investment response format is invalid.",
      response.status
    );
  }

  return createdInvestment;
}


export async function createInvestmentEvent(
  input: InvestFundsInput
): Promise<void> {
  const session = await requireRole("admin");

  const body = {
    shares: input.shares,
    share_price: input.sharePrice,
    investment_vehicle: input.investmentVehicle,
    notes: input.notes,
  };

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/investment-events/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new InvestmentsApiError(
      "Unable to reach the investments service. Please try again.",
      0
    );
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.status === 401 || response.status === 403) {
      throw new InvestmentsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new InvestmentsApiError(
      backendMessage ?? "Unable to invest funds at the moment.",
      response.status
    );
  }
}


export async function createFundReallocation(
  input: ReallocateFundsInput
): Promise<void> {
  const session = await requireRole("admin");

  const body = {
    source_vehicle: String(input.sourceVehicle),
    destination_vehicle: String(input.destinationVehicle),
    amount: input.amount,
  };

  let response: Response;
  try {
    response = await fetch(buildBackendUrl("/fund-reallocations/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new InvestmentsApiError(
      "Unable to reach the investments service. Please try again.",
      0
    );
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.status === 401 || response.status === 403) {
      throw new InvestmentsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new InvestmentsApiError(
      backendMessage ?? "Unable to reallocate funds at the moment.",
      response.status
    );
  }
}
