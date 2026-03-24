"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

import type { MemberSummary } from "../types";

const rwfNumberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

function formatRwf(value: string): string {
  const parsedValue = Number.parseFloat(value);
  if (!Number.isFinite(parsedValue)) {
    return "0 RWF";
  }

  return `${rwfNumberFormat.format(parsedValue)} RWF`;
}

function formatCount(value: string): string {
  const parsedValue = Number.parseFloat(value);
  if (!Number.isFinite(parsedValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(parsedValue);
}

function formatGrowthBadge(growth: string): string {
  const value = Number.parseFloat(growth) * 100;
  if (!Number.isFinite(value)) return "+0%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function isGrowthNegative(growth: string): boolean {
  const value = Number.parseFloat(growth);
  return Number.isFinite(value) && value < 0;
}

type MemberSummaryCardsProps = {
  summary: MemberSummary;
};

export function MemberSummaryCards({ summary }: MemberSummaryCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lifetime Contributions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRwf(summary.lifetime.amount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isGrowthNegative(summary.lifetime.growth) ? (
                <TrendingDownIcon />
              ) : (
                <TrendingUpIcon />
              )}
              {formatGrowthBadge(summary.lifetime.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Your total contributions
          </div>
          <div className="text-muted-foreground">
            Accumulated over your membership
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Group Total</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRwf(summary.group.amount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isGrowthNegative(summary.group.growth) ? (
                <TrendingDownIcon />
              ) : (
                <TrendingUpIcon />
              )}
              {formatGrowthBadge(summary.group.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Combined group contributions
          </div>
          <div className="text-muted-foreground">
            Total from all members
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Membership</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(summary.membership.amount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isGrowthNegative(summary.membership.growth) ? (
                <TrendingDownIcon />
              ) : (
                <TrendingUpIcon />
              )}
              {formatGrowthBadge(summary.membership.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Membership status
          </div>
          <div className="text-muted-foreground">
            Your membership metrics
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Investments</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCount(summary.investment.amount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isGrowthNegative(summary.investment.growth) ? (
                <TrendingDownIcon />
              ) : (
                <TrendingUpIcon />
              )}
              {formatGrowthBadge(summary.investment.growth)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Investment vehicles
          </div>
          <div className="text-muted-foreground">
            Across all investment types
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
