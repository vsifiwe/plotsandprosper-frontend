import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatVehicleType, type Investment } from "../types";

type InvestmentsListProps = {
  investments: Investment[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function InvestmentsList({ investments }: InvestmentsListProps) {
  if (investments.length === 0) {
    return (
      <div className="rounded-md border py-6 text-center text-sm text-zinc-600">
        No investments found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {investments.map((investment) => (
          <article key={investment.id} className="space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{investment.name}</h3>
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Vehicle type</dt>
                <dd>{formatVehicleType(investment.vehicleType)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Description</dt>
                <dd>{investment.description}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Created</dt>
                <dd>{formatDate(investment.createdAt)}</dd>
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
              <TableHead>Vehicle type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment) => (
              <TableRow key={investment.id}>
                <TableCell className="font-medium">{investment.name}</TableCell>
                <TableCell>{formatVehicleType(investment.vehicleType)}</TableCell>
                <TableCell>{investment.description}</TableCell>
                <TableCell>{formatDate(investment.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
