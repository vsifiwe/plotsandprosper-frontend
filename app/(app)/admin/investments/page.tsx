import { AdminInvestmentsClient } from "./components/admin-investments-client";
import { fetchAdminInvestments, InvestmentsApiError } from "./lib/investments-api";
import { type Investment } from "./types";

type SearchParams = {
  page?: string | string[];
};

type AdminInvestmentsPageProps = {
  searchParams?: Promise<SearchParams>;
};

function parsePageNumber(pageValue: string | string[] | undefined): number {
  const rawPage = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  if (!rawPage) return 1;

  const page = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export default async function AdminInvestmentsPage({
  searchParams,
}: AdminInvestmentsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = parsePageNumber(resolvedSearchParams.page);

  let initialInvestments: Investment[] = [];
  let totalInvestmentsCount = 0;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let loadError: string | null = null;

  try {
    const response = await fetchAdminInvestments(currentPage);
    initialInvestments = response.results;
    totalInvestmentsCount = response.count;
    hasNextPage = response.next !== null;
    hasPreviousPage = response.previous !== null;
  } catch (error) {
    if (error instanceof InvestmentsApiError) {
      loadError = error.message;
    } else {
      loadError = "Unable to load investments at the moment.";
    }
  }

  return (
    <AdminInvestmentsClient
      initialInvestments={initialInvestments}
      totalInvestmentsCount={totalInvestmentsCount}
      currentPage={currentPage}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      loadError={loadError}
    />
  );
}
