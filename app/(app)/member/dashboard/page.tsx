import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MemberSummaryCards } from "./components/member-summary-cards";
import { TransactionsList } from "./components/transactions-list";
import {
  fetchMemberTransactions,
  TransactionsApiError,
} from "./lib/transactions-api";
import {
  fetchMemberSummary,
  SummaryApiError,
} from "./lib/summary-api";
import type { MemberSummary, Transaction } from "./types";

type SearchParams = {
  page?: string | string[];
};

type MemberDashboardPageProps = {
  searchParams?: Promise<SearchParams>;
};

function parsePageNumber(pageValue: string | string[] | undefined): number {
  const rawPage = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  if (!rawPage) return 1;

  const page = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

const DEFAULT_SUMMARY: MemberSummary = {
  lifetime: { amount: "0", growth: "0" },
  group: { amount: "0", growth: "0" },
  membership: { amount: "0", growth: "0" },
  investment: { amount: "0", growth: "0" },
};

export default async function MemberDashboardPage({
  searchParams,
}: MemberDashboardPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = parsePageNumber(resolvedSearchParams.page);

  let summary = DEFAULT_SUMMARY;
  let summaryError: string | null = null;

  let transactions: Transaction[] = [];
  let totalCount = 0;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let transactionsError: string | null = null;

  const [summaryResult, transactionsResult] = await Promise.allSettled([
    fetchMemberSummary(),
    fetchMemberTransactions(currentPage),
  ]);

  if (summaryResult.status === "fulfilled") {
    summary = summaryResult.value;
  } else {
    const error = summaryResult.reason;
    summaryError =
      error instanceof SummaryApiError
        ? error.message
        : "Unable to load summary at the moment.";
  }

  if (transactionsResult.status === "fulfilled") {
    const response = transactionsResult.value;
    transactions = response.results;
    totalCount = response.count;
    hasNextPage = response.count > currentPage * response.pageSize;
    hasPreviousPage = currentPage > 1;
  } else {
    const error = transactionsResult.reason;
    transactionsError =
      error instanceof TransactionsApiError
        ? error.message
        : "Unable to load transactions at the moment.";
  }

  function pageHref(pageNumber: number): string {
    if (pageNumber <= 1) return "/member/dashboard";
    return `/member/dashboard?page=${pageNumber}`;
  }

  return (
    <main className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {summaryError ? (
          <div className="mx-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
            {summaryError}
          </div>
        ) : null}

        <MemberSummaryCards summary={summary} />

        <div className="px-4 lg:px-6">
          {transactionsError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {transactionsError}
            </div>
          ) : null}

          <TransactionsList transactions={transactions} />

          {!transactionsError && totalCount > 0 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-600">
                Total transactions: {totalCount}
              </p>

              <div className="flex items-center gap-2">
                {hasPreviousPage ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={pageHref(currentPage - 1)}>Previous</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                )}

                <span className="text-sm text-zinc-600">
                  Page {currentPage}
                </span>

                {hasNextPage ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={pageHref(currentPage + 1)}>Next</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
