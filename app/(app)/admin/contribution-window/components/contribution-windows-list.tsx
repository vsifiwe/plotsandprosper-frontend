import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ContributionWindow } from "../types";

type ContributionWindowsListProps = {
  windows: ContributionWindow[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: string) {
  // Format should be 1,000,000 RWF
  const value = parseFloat(amount);
  if (Number.isNaN(value) || value < 0) {
    return "0 RWF";
  }
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value)} RWF`;
}

export function ContributionWindowsList({ windows }: ContributionWindowsListProps) {
  if (windows.length === 0) {
    return (
      <div className="rounded-md border py-6 text-center text-sm text-zinc-600">
        No contribution windows found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {windows.map((window) => (
          <article key={window.id} className="space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{window.name}</h3>
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Start Date</dt>
                <dd>{formatDateTime(window.start_at)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">End Date</dt>
                <dd>{formatDateTime(window.end_at)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Minimum Amount</dt>
                <dd>{formatCurrency(window.min_amount)}</dd>
              </div>
              {window.max_amount && (
                <div>
                  <dt className="text-zinc-500">Maximum Amount</dt>
                  <dd>{formatCurrency(window.max_amount)}</dd>
                </div>
              )}
              <div>
                <dt className="text-zinc-500">Created</dt>
                <dd>{formatDate(window.created_at)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Min Amount</TableHead>
              <TableHead>Max Amount</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {windows.map((window) => (
              <TableRow key={window.id}>
                <TableCell className="font-medium">{window.name}</TableCell>
                <TableCell>{formatDateTime(window.start_at)}</TableCell>
                <TableCell>{formatDateTime(window.end_at)}</TableCell>
                <TableCell>{formatCurrency(window.min_amount)}</TableCell>
                <TableCell>
                  {window.max_amount ? formatCurrency(window.max_amount) : "-"}
                </TableCell>
                <TableCell>{formatDate(window.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
