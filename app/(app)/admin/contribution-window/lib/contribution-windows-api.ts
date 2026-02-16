import "server-only";

import { requireRole } from "@/app/lib/auth";

import {
  type ContributionWindow,
  type CreateContributionWindowInput,
  type PaginatedContributionWindows,
  type PaginationParams,
} from "../types";

const DEFAULT_CONTRIBUTION_WINDOWS_ENDPOINT =
  "http://localhost:8000/api/v1/contribution-windows/";
export const CONTRIBUTION_WINDOWS_PAGE_SIZE = 10;

type BackendContributionWindow = {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
  min_amount: string;
  max_amount: string | null;
  created_at: string;
};

type CreateBackendContributionWindowPayload = {
  name: string;
  start_at: string;
  end_at: string;
  min_amount: number;
};

export class ContributionWindowsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ContributionWindowsApiError";
    this.status = status;
  }
}

function getContributionWindowsEndpoint(): string {
  const configuredEndpoint = process.env.BACKEND_CONTRIBUTION_WINDOWS_ENDPOINT?.trim();
  if (configuredEndpoint && configuredEndpoint.length > 0) {
    return configuredEndpoint;
  }

  return DEFAULT_CONTRIBUTION_WINDOWS_ENDPOINT;
}

function parseBackendContributionWindow(payload: unknown): ContributionWindow | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const backendWindow = payload as Partial<BackendContributionWindow>;
  if (
    typeof backendWindow.id !== "number" ||
    typeof backendWindow.name !== "string" ||
    typeof backendWindow.start_at !== "string" ||
    typeof backendWindow.end_at !== "string" ||
    typeof backendWindow.min_amount !== "string" ||
    typeof backendWindow.created_at !== "string" ||
    (backendWindow.max_amount !== null && typeof backendWindow.max_amount !== "string")
  ) {
    return null;
  }

  return {
    id: backendWindow.id,
    name: backendWindow.name,
    start_at: backendWindow.start_at,
    end_at: backendWindow.end_at,
    min_amount: backendWindow.min_amount,
    max_amount: backendWindow.max_amount,
    created_at: backendWindow.created_at,
  };
}

function parseContributionWindows(payload: unknown): ContributionWindow[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const windows: ContributionWindow[] = [];
  for (const item of payload) {
    const window = parseBackendContributionWindow(item);
    if (!window) {
      return null;
    }

    windows.push(window);
  }

  return windows;
}

function parsePaginatedContributionWindows(
  payload: unknown
): PaginatedContributionWindows | null {
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
    !Array.isArray(data.results) ||
    typeof data.count !== "number" ||
    (data.next !== null && typeof data.next !== "string") ||
    (data.previous !== null && typeof data.previous !== "string")
  ) {
    return null;
  }

  const windows = parseContributionWindows(data.results);
  if (!windows) {
    return null;
  }

  return {
    results: windows,
    count: data.count,
    next: data.next ?? null,
    previous: data.previous ?? null,
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

function mapCreateInputToPayload(
  input: CreateContributionWindowInput
): CreateBackendContributionWindowPayload {
  return {
    name: input.name,
    start_at: input.start_at,
    end_at: input.end_at,
    min_amount: input.min_amount,
  };
}

export async function fetchContributionWindows(
  params?: PaginationParams
): Promise<PaginatedContributionWindows> {
  const session = await requireRole("admin");

  // Build URL with pagination parameters
  const url = new URL(getContributionWindowsEndpoint());
  if (params?.page) {
    url.searchParams.set("page", params.page.toString());
  }
  url.searchParams.set(
    "page_size",
    String(params?.pageSize ?? CONTRIBUTION_WINDOWS_PAGE_SIZE)
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
    throw new ContributionWindowsApiError(
      "Unable to reach the contribution windows service. Please try again.",
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
      throw new ContributionWindowsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new ContributionWindowsApiError(
      backendMessage ?? "Unable to load contribution windows at the moment.",
      response.status
    );
  }

  const paginatedWindows = parsePaginatedContributionWindows(payload);
  if (!paginatedWindows) {
    throw new ContributionWindowsApiError(
      "Contribution windows response format is invalid.",
      response.status
    );
  }

  return paginatedWindows;
}

export async function createContributionWindow(
  input: CreateContributionWindowInput
): Promise<ContributionWindow> {
  const session = await requireRole("admin");
  const payload = mapCreateInputToPayload(input);

  let response: Response;
  try {
    response = await fetch(getContributionWindowsEndpoint(), {
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
    throw new ContributionWindowsApiError(
      "Unable to reach the contribution windows service. Please try again.",
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
      throw new ContributionWindowsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(responsePayload);
    throw new ContributionWindowsApiError(
      backendMessage ?? "Unable to create contribution window at the moment.",
      response.status
    );
  }

  const createdWindow = parseBackendContributionWindow(responsePayload);
  if (!createdWindow) {
    throw new ContributionWindowsApiError(
      "Create contribution window response format is invalid.",
      response.status
    );
  }

  return createdWindow;
}
