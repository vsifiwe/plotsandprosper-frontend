import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { Transaction, TransactionType } from "../types";

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value;
  return (
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(num) + " RWF"
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTransactionType(type: TransactionType): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function transactionTypeBadgeVariant(
  type: TransactionType
): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "CONTRIBUTION":
      return "default";
    case "WITHDRAWAL":
      return "secondary";
    case "PENALTY":
      return "destructive";
    default:
      return "outline";
  }
}

type TransactionsListProps = {
  transactions: Transaction[];
};

export function TransactionsList({ transactions }: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-md border py-6 text-center text-sm text-zinc-600">
        No transactions found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {transactions.map((transaction, index) => (
          <article key={index} className="space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">
                {transaction.description}
              </h3>
              <Badge variant={transactionTypeBadgeVariant(transaction.type)}>
                {formatTransactionType(transaction.type)}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Date</dt>
                <dd>{formatDate(transaction.date)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Amount</dt>
                <dd>{formatCurrency(transaction.amount)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-500">Cumulative Contributions</dt>
                <dd>{formatCurrency(transaction.cumulativeContributions)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">
                Cumulative Contributions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge
                    variant={transactionTypeBadgeVariant(transaction.type)}
                  >
                    {formatTransactionType(transaction.type)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.cumulativeContributions)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
