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
import { BarChart3Icon } from "lucide-react";

import type { Investment, VehicleType } from "../types";

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value;
  return (
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(num) + " RWF"
  );
}

function formatVehicleType(type: VehicleType): string {
  switch (type) {
    case "LAND":
      return "Land";
    case "SHARES":
      return "Shares";
    case "SAVINGS_ACCOUNT":
      return "Savings Account";
    case "TREASURY_BOND":
      return "Treasury Bond";
    case "FIXED_DEPOSIT":
      return "Fixed Deposit";
    default:
      return "Other";
  }
}

function vehicleTypeBadgeVariant(
  type: VehicleType
): "default" | "secondary" | "outline" {
  switch (type) {
    case "LAND":
      return "default";
    case "SHARES":
      return "secondary";
    default:
      return "outline";
  }
}

type InvestmentsListProps = {
  investments: Investment[];
};

export function InvestmentsList({ investments }: InvestmentsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <BarChart3Icon className="text-muted-foreground size-5" />
            </div>
            <div>
              <CardTitle>Investments</CardTitle>
              <CardDescription>
                {investments.length > 0
                  ? `${investments.length} investment${investments.length !== 1 ? "s" : ""} in portfolio`
                  : "No investments yet"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
              <BarChart3Icon className="text-muted-foreground size-6" />
            </div>
            <p className="text-sm font-medium">No investments found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Your investments will appear here once recorded.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="border-border rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {investment.name}
                        </p>
                        <Badge
                          variant={vehicleTypeBadgeVariant(
                            investment.vehicleType
                          )}
                        >
                          {formatVehicleType(investment.vehicleType)}
                        </Badge>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCurrency(investment.currentValue)}
                    </p>
                  </div>
                  {investment.description ? (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {investment.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[160px]">Type</TableHead>
                    <TableHead className="w-[150px] text-right">
                      Current Value
                    </TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">
                        {investment.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={vehicleTypeBadgeVariant(
                            investment.vehicleType
                          )}
                        >
                          {formatVehicleType(investment.vehicleType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(investment.currentValue)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {investment.description}
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
