import "server-only";

import { requireRole } from "@/app/lib/auth";

const DEFAULT_CONTRIBUTIONS_ENDPOINT =
  "http://localhost:8000/api/v1/contributions/";
export const CONTRIBUTIONS_PAGE_SIZE = 10;

export type ContributionStatus = "POSTED" | "PENDING";

export type Contribution = {
  id: string;
  memberName: string;
  memberId: string;
  amount: number;
  status: ContributionStatus;
  receivedAt: string;
  receiptNumber: string;
  notes?: string;
  contributionWindowName?: string;
};

export type CreateContributionInput = {
  windowId: number;
  memberId: string;
  amount: number;
  recordedAt: string;
};

type BackendContribution = {
  id: number;
  amount: string | number;
  recorded_at: string;
  created_at?: string;
  member:
    | string
    | {
        id: string;
        full_name: string;
      };
  window: number;
  window_details?:
    | null
    | {
        id: number;
        start_at: string;
        end_at: string;
        min_amount: string;
        max_amount: string | null;
        name: string;
        created_at: string;
      };
};

type PaginatedContributionsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contribution[];
};

type PaginationParams = {
  page?: number;
  pageSize?: number;
};

type CreateBackendContributionPayload = {
  window: number;
  member: string;
  amount: number;
  recorded_at: string;
};

export class ContributionsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ContributionsApiError";
    this.status = status;
  }
}

function getContributionsEndpoint(): string {
  const configuredEndpoint = process.env.BACKEND_CONTRIBUTIONS_ENDPOINT?.trim();
  if (configuredEndpoint && configuredEndpoint.length > 0) {
    return configuredEndpoint;
  }

  return DEFAULT_CONTRIBUTIONS_ENDPOINT;
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

function parseMember(
  payload: unknown
): { memberId: string; memberName: string } | null {
  if (typeof payload === "string") {
    return {
      memberId: payload,
      memberName: payload,
    };
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const member = payload as { id?: unknown; full_name?: unknown };
  if (typeof member.id !== "string" || typeof member.full_name !== "string") {
    return null;
  }

  return {
    memberId: member.id,
    memberName: member.full_name,
  };
}

function parseContributionWindowName(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const windowDetails = payload as { name?: unknown };
  if (typeof windowDetails.name !== "string") {
    return undefined;
  }

  return windowDetails.name;
}

function parseBackendContribution(payload: unknown): Contribution | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const backendContribution = payload as Partial<BackendContribution>;
  if (
    typeof backendContribution.id !== "number" ||
    (typeof backendContribution.amount !== "string" &&
      typeof backendContribution.amount !== "number") ||
    typeof backendContribution.recorded_at !== "string" ||
    typeof backendContribution.window !== "number"
  ) {
    return null;
  }

  const parsedMember = parseMember(backendContribution.member);
  if (!parsedMember) {
    return null;
  }

  const amount =
    typeof backendContribution.amount === "number"
      ? backendContribution.amount
      : Number.parseFloat(backendContribution.amount);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return {
    id: String(backendContribution.id),
    memberName: parsedMember.memberName,
    memberId: parsedMember.memberId,
    amount,
    status: "POSTED",
    receivedAt: backendContribution.recorded_at,
    receiptNumber: `CTR-${backendContribution.id}`,
    contributionWindowName: parseContributionWindowName(
      backendContribution.window_details
    ),
  };
}

function parseContributions(payload: unknown): Contribution[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const contributions: Contribution[] = [];
  for (const item of payload) {
    const contribution = parseBackendContribution(item);
    if (!contribution) {
      return null;
    }

    contributions.push(contribution);
  }

  return contributions;
}

function parsePaginatedContributions(
  payload: unknown
): PaginatedContributionsResponse | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    results?: unknown;
    count?: unknown;
    next?: unknown;
    previous?: unknown;
  };

  if (
    typeof data.count !== "number" ||
    data.count < 0 ||
    !Array.isArray(data.results) ||
    (data.next !== null && typeof data.next !== "string") ||
    (data.previous !== null && typeof data.previous !== "string")
  ) {
    return null;
  }

  const contributions = parseContributions(data.results);
  if (!contributions) {
    return null;
  }

  return {
    count: data.count,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: contributions,
  };
}

function mapCreateInputToPayload(
  input: CreateContributionInput
): CreateBackendContributionPayload {
  return {
    window: input.windowId,
    member: input.memberId,
    amount: input.amount,
    recorded_at: input.recordedAt,
  };
}

export async function fetchContributions(
  params?: PaginationParams
): Promise<PaginatedContributionsResponse> {
  const session = await requireRole("admin");

  const url = new URL(getContributionsEndpoint());
  if (params?.page) {
    url.searchParams.set("page", String(params.page));
  }
  url.searchParams.set(
    "page_size",
    String(params?.pageSize ?? CONTRIBUTIONS_PAGE_SIZE)
  );

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new ContributionsApiError(
      "Unable to reach the contributions service. Please try again.",
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
      throw new ContributionsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new ContributionsApiError(
      backendMessage ?? "Unable to load contributions at the moment.",
      response.status
    );
  }

  const contributionsPage = parsePaginatedContributions(payload);
  if (!contributionsPage) {
    throw new ContributionsApiError(
      "Contributions response format is invalid.",
      response.status
    );
  }

  return contributionsPage;
}

export async function createContribution(
  input: CreateContributionInput
): Promise<Contribution> {
  const session = await requireRole("admin");
  const payload = mapCreateInputToPayload(input);

  console.log("payload", payload);

  let response: Response;
  try {
    response = await fetch(getContributionsEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch(error) {
    console.error("Error creating contribution", error);
    throw new ContributionsApiError(
      "Unable to reach the contributions service. Please try again.",
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
      throw new ContributionsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(responsePayload);
    throw new ContributionsApiError(
      backendMessage ?? "Unable to create contribution at the moment.",
      response.status
    );
  }

  const createdContribution = parseBackendContribution(responsePayload);
  if (!createdContribution) {
    throw new ContributionsApiError(
      "Create contribution response format is invalid.",
      response.status
    );
  }

  return createdContribution;
}
