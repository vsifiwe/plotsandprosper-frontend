import {
  fetchContributionWindows,
  ContributionWindowsApiError,
  CONTRIBUTION_WINDOWS_PAGE_SIZE,
} from "./lib/contribution-windows-api";
import { AdminContributionWindowsClient } from "./components/admin-contribution-windows-client";
import { type PaginatedContributionWindows } from "./types";

type SearchParams = {
  page?: string | string[];
};

type AdminContributionWindowPageProps = {
  searchParams?: Promise<SearchParams>;
};

function parsePageNumber(pageValue: string | string[] | undefined): number {
  const rawPage = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  if (!rawPage) return 1;

  const page = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export default async function AdminContributionWindowPage({
  searchParams,
}: AdminContributionWindowPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = parsePageNumber(resolvedSearchParams.page);

  let initialData: PaginatedContributionWindows = {
    results: [],
    count: 0,
    next: null,
    previous: null,
  };
  let hasNextPage = false;
  let hasPreviousPage = false;
  let loadError: string | null = null;

  try {
    initialData = await fetchContributionWindows({
      page: currentPage,
      pageSize: CONTRIBUTION_WINDOWS_PAGE_SIZE,
    });
    hasNextPage = initialData.next !== null;
    hasPreviousPage = initialData.previous !== null;
  } catch (error) {
    if (error instanceof ContributionWindowsApiError) {
      loadError = error.message;
    } else {
      loadError = "Unable to load contribution windows at the moment.";
    }
  }

  return (
    <AdminContributionWindowsClient
      initialData={initialData}
      currentPage={currentPage}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      loadError={loadError}
    />
  );
}
