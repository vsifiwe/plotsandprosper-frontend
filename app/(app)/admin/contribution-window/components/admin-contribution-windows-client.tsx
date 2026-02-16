"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createContributionWindowAction } from "../actions";
import { AddContributionWindowDialog } from "../forms/add-contribution-window-dialog";
import { CreateContributionWindowInput, PaginatedContributionWindows } from "../types";
import { ContributionWindowsList } from "./contribution-windows-list";
import { Button } from "@/components/ui/button";

type AdminContributionWindowsClientProps = {
  initialData: PaginatedContributionWindows;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loadError: string | null;
};

function pageHref(pageNumber: number): string {
  if (pageNumber <= 1) return "/admin/contribution-window";
  return `/admin/contribution-window?page=${pageNumber}`;
}

export function AdminContributionWindowsClient({
  initialData,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  loadError,
}: AdminContributionWindowsClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateWindow = async (windowData: CreateContributionWindowInput) => {
    setIsSaving(true);

    try {
      const result = await createContributionWindowAction(windowData);
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
          <h2 className="text-xl font-semibold">Contribution Windows</h2>
          <p className="text-sm text-zinc-600">
            Manage contribution windows and deadlines for members
          </p>
        </div>
        <AddContributionWindowDialog isSaving={isSaving} onSubmit={handleCreateWindow} />
      </div>

      {loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <ContributionWindowsList windows={initialData.results} />

      {!loadError && initialData.count > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            Total windows: {initialData.count}
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
