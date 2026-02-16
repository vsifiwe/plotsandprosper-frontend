import { fetchAdminMembers, MembersApiError } from "./lib/members-api";
import { AdminMembersClient } from "./components/admin-members-client";
import { type Member } from "./types";

type SearchParams = {
  page?: string | string[];
};

type AdminMembersPageProps = {
  searchParams?: Promise<SearchParams>;
};

function parsePageNumber(pageValue: string | string[] | undefined): number {
  const rawPage = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  if (!rawPage) return 1;

  const page = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = parsePageNumber(resolvedSearchParams.page);

  let initialMembers: Member[] = [];
  let totalMembersCount = 0;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let loadError: string | null = null;

  try {
    const response = await fetchAdminMembers(currentPage);
    initialMembers = response.results;
    totalMembersCount = response.count;
    hasNextPage = response.next !== null;
    hasPreviousPage = response.previous !== null;
  } catch (error) {
    if (error instanceof MembersApiError) {
      loadError = error.message;
    } else {
      loadError = "Unable to load members at the moment.";
    }
  }

  return (
    <AdminMembersClient
      initialMembers={initialMembers}
      totalMembersCount={totalMembersCount}
      currentPage={currentPage}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      loadError={loadError}
    />
  );
}
