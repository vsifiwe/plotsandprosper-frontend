import "server-only";

import { requireRole } from "@/app/lib/auth";
import { buildBackendUrl, extractErrorMessage } from "@/app/lib/server-api-utils";

import type { PaginatedTransactions, Transaction } from "../types";
export const TRANSACTIONS_PAGE_SIZE = 20;

type BackendTransaction = {
  date: string;
  description: string;
  amount: string;
  cumulative_contributions: string;
  type: string;
};

export class TransactionsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TransactionsApiError";
    this.status = status;
  }
}

function createTransactionsUrl(page: number): string {
  const endpoint = buildBackendUrl("/members/me/statement/transactions/");
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const url = new URL(endpoint);
  url.searchParams.set("page", String(safePage));
  url.searchParams.set("page_size", String(TRANSACTIONS_PAGE_SIZE));
  return url.toString();
}

function parseBackendTransaction(payload: unknown): Transaction | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as Partial<BackendTransaction>;
  if (
    typeof raw.date !== "string" ||
    typeof raw.description !== "string" ||
    typeof raw.amount !== "string" ||
    typeof raw.cumulative_contributions !== "string" ||
    typeof raw.type !== "string"
  ) {
    return null;
  }

  return {
    date: raw.date,
    description: raw.description,
    amount: raw.amount,
    cumulativeContributions: raw.cumulative_contributions,
    type: raw.type as Transaction["type"],
  };
}

function parseTransactions(payload: unknown): Transaction[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const transactions: Transaction[] = [];
  for (const item of payload) {
    const transaction = parseBackendTransaction(item);
    if (!transaction) {
      return null;
    }
    transactions.push(transaction);
  }

  return transactions;
}

function parsePaginatedTransactions(
  payload: unknown
): PaginatedTransactions | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as {
    count?: unknown;
    page?: unknown;
    page_size?: unknown;
    results?: unknown;
  };

  if (
    typeof raw.count !== "number" ||
    raw.count < 0 ||
    !Number.isFinite(raw.count)
  ) {
    return null;
  }

  const results = parseTransactions(raw.results);
  if (!results) {
    return null;
  }

  return {
    count: raw.count,
    page: typeof raw.page === "number" ? raw.page : 1,
    pageSize:
      typeof raw.page_size === "number" ? raw.page_size : TRANSACTIONS_PAGE_SIZE,
    results,
  };
}

export async function fetchAdminPersonalTransactions(
  page = 1
): Promise<PaginatedTransactions> {
  const session = await requireRole("admin");

  let response: Response;
  try {
    response = await fetch(createTransactionsUrl(page), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new TransactionsApiError(
      "Unable to reach the transactions service. Please try again.",
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
      throw new TransactionsApiError(
        "Your session is no longer valid. Please sign in again.",
        response.status
      );
    }

    const backendMessage = extractErrorMessage(payload);
    throw new TransactionsApiError(
      backendMessage ?? "Unable to load transactions at the moment.",
      response.status
    );
  }

  const transactionsPage = parsePaginatedTransactions(payload);
  if (!transactionsPage) {
    throw new TransactionsApiError(
      "Transactions response format is invalid.",
      response.status
    );
  }

  return transactionsPage;
}
