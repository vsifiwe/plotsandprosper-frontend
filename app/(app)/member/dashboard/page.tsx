import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { MemberSummaryCards } from "./components/member-summary-cards";
import { TransactionsList } from "./components/transactions-list";
import { InvestmentsList } from "./components/investments-list";
import {
  fetchMemberTransactions,
  TransactionsApiError,
} from "./lib/transactions-api";
import {
  fetchMemberSummary,
  SummaryApiError,
} from "./lib/summary-api";
import {
  fetchMemberInvestments,
  InvestmentsApiError,
} from "./lib/investments-api";
import type { MemberSummary, Transaction, Investment } from "./types";

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
  let totalPages = 1;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let transactionsError: string | null = null;

  let investments: Investment[] = [];
  let investmentsError: string | null = null;

  const [summaryResult, transactionsResult, investmentsResult] =
    await Promise.allSettled([
      fetchMemberSummary(),
      fetchMemberTransactions(currentPage),
      fetchMemberInvestments(),
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
    totalPages = Math.max(1, Math.ceil(response.count / response.pageSize));
    hasNextPage = response.count > currentPage * response.pageSize;
    hasPreviousPage = currentPage > 1;
  } else {
    const error = transactionsResult.reason;
    transactionsError =
      error instanceof TransactionsApiError
        ? error.message
        : "Unable to load transactions at the moment.";
  }

  if (investmentsResult.status === "fulfilled") {
    investments = investmentsResult.value;
  } else {
    const error = investmentsResult.reason;
    investmentsError =
      error instanceof InvestmentsApiError
        ? error.message
        : "Unable to load investments at the moment.";
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
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {transactionsError}
            </div>
          ) : null}

          <TransactionsList
            transactions={transactions}
            totalCount={totalCount}
          />

          {!transactionsError && totalCount > 0 ? (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-1">
                {hasPreviousPage ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={pageHref(currentPage - 1)}>
                      <ChevronLeftIcon className="mr-1 size-4" />
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeftIcon className="mr-1 size-4" />
                    Previous
                  </Button>
                )}

                {hasNextPage ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={pageHref(currentPage + 1)}>
                      Next
                      <ChevronRightIcon className="ml-1 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Next
                    <ChevronRightIcon className="ml-1 size-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : null}

          {investmentsError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {investmentsError}
            </div>
          ) : null}

          <div className="mt-4">
            <InvestmentsList investments={investments} />
          </div>
        </div>
      </div>
    </main>
  );
}
