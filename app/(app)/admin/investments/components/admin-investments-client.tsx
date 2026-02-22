"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createInvestmentAction } from "../actions";
import { AddInvestmentDialog } from "../forms/add-investment-dialog";
import { InvestmentsList } from "./investments-list";
import { type CreateInvestmentInput, type Investment } from "../types";
import { Button } from "@/components/ui/button";

type AdminInvestmentsClientProps = {
  initialInvestments: Investment[];
  totalInvestmentsCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loadError: string | null;
};

function pageHref(pageNumber: number): string {
  if (pageNumber <= 1) return "/admin/investments";
  return `/admin/investments?page=${pageNumber}`;
}

export function AdminInvestmentsClient({
  initialInvestments,
  totalInvestmentsCount,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  loadError,
}: AdminInvestmentsClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateInvestment = async (investmentData: CreateInvestmentInput) => {
    setIsSaving(true);

    try {
      const result = await createInvestmentAction(investmentData);
      if (!result.ok) {
        throw new Error(result.message);
      }

      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Investments</h2>
          <p className="text-sm text-zinc-600">
            Manage all investment vehicles and allocations
          </p>
        </div>
        <AddInvestmentDialog
          isSaving={isSaving}
          onSubmit={handleCreateInvestment}
        />
      </div>

      {loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <InvestmentsList investments={initialInvestments} />

      {!loadError && totalInvestmentsCount > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            Total investments: {totalInvestmentsCount}
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

            <span className="text-sm text-zinc-600">Page {currentPage}</span>

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
    </main>
  );
}
