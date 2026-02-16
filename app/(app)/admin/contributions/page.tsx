import Link from "next/link";

import {
  fetchContributions,
  type ContributionStatus,
} from "@/app/(app)/admin/contributions/lib/contributions-mock-api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CONTRIBUTIONS_PER_PAGE = 10;
export const dynamic = "force-dynamic";

// Rwandan Franc (RWF): no decimals, comma thousands separator, symbol after number (e.g. 1,000,000 RWF)
const rwfNumberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

function formatRwf(amount: number): string {
  return `${rwfNumberFormat.format(amount)} RWF`;
}

type SearchParams = {
  page?: string | string[];
};

type AdminContributionsPageProps = {
  searchParams?: Promise<SearchParams>;
};

function statusClassName(status: ContributionStatus): string {
  if (status === "POSTED") return "bg-emerald-100 text-emerald-800";
  return "bg-amber-100 text-amber-800";
}

function parsePageNumber(pageValue: string | string[] | undefined): number {
  const rawPage = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  if (!rawPage) return 1;

  const page = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

function pageHref(pageNumber: number): string {
  if (pageNumber <= 1) return "/admin/contributions";
  return `/admin/contributions?page=${pageNumber}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default async function AdminContributionsPage({
  searchParams,
}: AdminContributionsPageProps) {
  const contributionsPromise = fetchContributions();
  const resolvedSearchParams = (await searchParams) ?? {};
  const allContributions = await contributionsPromise;
  const currentPage = parsePageNumber(resolvedSearchParams.page);
  const totalContributions = allContributions.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalContributions / CONTRIBUTIONS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * CONTRIBUTIONS_PER_PAGE;
  const endIndex = startIndex + CONTRIBUTIONS_PER_PAGE;
  const pageContributions = allContributions.slice(startIndex, endIndex);
  const firstContributionIndex = totalContributions === 0 ? 0 : startIndex + 1;
  const lastContributionIndex = startIndex + pageContributions.length;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasPreviousPage = safePage > 1;
  const hasNextPage = safePage < totalPages;

  return (
    <main className="space-y-5">
      <div className="flex flex-col items-start gap-3">
        <Button asChild size="sm">
          <Link href="/admin/contributions/new">Log new contribution</Link>
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Contributions</h2>
          <p className="text-sm text-zinc-600">
            All contributions submitted by members
          </p>
        </div>
      </div>

      {pageContributions.length === 0 ? (
        <div className="rounded-md border py-8 text-center text-sm text-zinc-600">
          No contributions found.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {pageContributions.map((contribution) => (
              <article
                key={contribution.id}
                className="space-y-3 rounded-md border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{contribution.memberName}</h3>
                    <p className="text-xs text-zinc-500">{contribution.memberId}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClassName(contribution.status)}`}
                  >
                    {contribution.status}
                  </span>
                </div>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <dt className="text-zinc-500">Amount</dt>
                    <dd>{formatRwf(contribution.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Method</dt>
                    <dd>{contribution.method}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Receipt</dt>
                    <dd>{contribution.receiptNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Received on</dt>
                    <dd>{formatDate(contribution.receivedAt)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Receipt number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>{contribution.memberName}</TableCell>
                    <TableCell>{contribution.memberId}</TableCell>
                    <TableCell>{formatRwf(contribution.amount)}</TableCell>
                    <TableCell>{contribution.method}</TableCell>
                    <TableCell>{contribution.receiptNumber}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClassName(contribution.status)}`}
                      >
                        {contribution.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(contribution.receivedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600">
              Showing {firstContributionIndex}-{lastContributionIndex} of{" "}
              {totalContributions} contributions
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {hasPreviousPage ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(safePage - 1)}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
              )}

              <div className="flex flex-wrap items-center gap-1">
                {pageNumbers.map((pageNumber) =>
                  pageNumber === safePage ? (
                    <Button key={pageNumber} size="sm" disabled>
                      {pageNumber}
                    </Button>
                  ) : (
                    <Button key={pageNumber} asChild size="sm" variant="outline">
                      <Link href={pageHref(pageNumber)}>{pageNumber}</Link>
                    </Button>
                  )
                )}
              </div>

              {hasNextPage ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(safePage + 1)}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
