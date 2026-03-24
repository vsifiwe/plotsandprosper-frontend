import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReceiptTextIcon } from "lucide-react";

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

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
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
  totalCount: number;
};

export function TransactionsList({
  transactions,
  totalCount,
}: TransactionsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <ReceiptTextIcon className="text-muted-foreground size-5" />
            </div>
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                {totalCount > 0
                  ? `${totalCount} transaction${totalCount !== 1 ? "s" : ""} on record`
                  : "No transactions yet"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
              <ReceiptTextIcon className="text-muted-foreground size-6" />
            </div>
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Your transactions will appear here once recorded.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="border-border flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {transaction.description}
                      </p>
                      <Badge
                        variant={transactionTypeBadgeVariant(transaction.type)}
                      >
                        {formatTransactionType(transaction.type)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDate(transaction.date)} at{" "}
                      {formatTime(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                      Total: {formatCurrency(transaction.cumulativeContributions)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[150px] text-right">
                      Amount
                    </TableHead>
                    <TableHead className="w-[180px] text-right">
                      Cumulative Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <span className="text-foreground text-sm">
                            {formatDate(transaction.date)}
                          </span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {formatTime(transaction.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transactionTypeBadgeVariant(
                            transaction.type
                          )}
                        >
                          {formatTransactionType(transaction.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right tabular-nums">
                        {formatCurrency(transaction.cumulativeContributions)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
