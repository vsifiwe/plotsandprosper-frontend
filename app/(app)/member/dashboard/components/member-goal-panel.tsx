"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarClock, Flag, Sparkles, Target } from "lucide-react";

import { createGoalAction } from "../actions";
import { CreateGoalDialog } from "../forms/create-goal-dialog";
import type { CreateMemberGoalInput, MemberGoal } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MemberGoalPanelProps = {
  initialGoal: MemberGoal | null;
  loadError: string | null;
};

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

function formatTimelineLabel(timeline: MemberGoal["timeline"]): string {
  switch (timeline) {
    case "3_MONTHS":
      return "3 months";
    case "6_MONTHS":
      return "6 months";
    case "1_YEAR":
      return "1 year";
  }
}

function clampProgress(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(100, parsed));
}

function formatProgress(value: string): string {
  return `${clampProgress(value).toFixed(2)}%`;
}

export function MemberGoalPanel({
  initialGoal,
  loadError,
}: MemberGoalPanelProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateGoal = async (input: CreateMemberGoalInput) => {
    setIsSaving(true);

    try {
      const result = await createGoalAction(input);
      if (!result.ok) {
        throw new Error(result.message);
      }

      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const progressValue = initialGoal ? clampProgress(initialGoal.progressPercentage) : 0;

  return (
    <>
      <Card className="shadow-xs">
        <CardHeader className="gap-4 border-b pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit gap-2">
                <Sparkles className="size-3.5" />
                Goal Tracker
              </Badge>
              <CardTitle className="text-2xl font-semibold md:text-3xl">
                {initialGoal ? "Your savings target is live" : "Turn your target into a visible plan"}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm">
                {initialGoal
                  ? "Track your progress, remaining gap, and savings momentum from one place."
                  : "Create a personal goal to keep your contributions focused and measurable."}
              </CardDescription>
            </div>

            {!initialGoal ? (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Target className="size-4" />
                Create goal
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          {loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {initialGoal ? (
            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
              <div className="rounded-xl border bg-muted/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Progress</p>
                    <div className="mt-2 text-4xl font-semibold tracking-tight">
                      {formatProgress(initialGoal.progressPercentage)}
                    </div>
                  </div>

                  <div className="bg-background rounded-xl border px-4 py-3 text-right">
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                      Current saved
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatRwf(initialGoal.currentValue)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="bg-muted h-4 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                    <span>0%</span>
                    <span>Target reached</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="bg-background rounded-xl border p-4">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Flag className="size-4" />
                    <span className="text-sm">Target amount</span>
                  </div>
                  <p className="mt-3 text-xl font-semibold">{formatRwf(initialGoal.targetAmount)}</p>
                </div>

                <div className="bg-background rounded-xl border p-4">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <ArrowUpRight className="size-4" />
                    <span className="text-sm">Remaining gap</span>
                  </div>
                  <p className="mt-3 text-xl font-semibold">{formatRwf(initialGoal.gapToTarget)}</p>
                </div>

                <div className="bg-background rounded-xl border p-4">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="size-4" />
                    <span className="text-sm">Timeline</span>
                  </div>
                  <p className="mt-3 text-xl font-semibold">{formatTimelineLabel(initialGoal.timeline)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border border-dashed bg-muted/20 p-6">
                <p className="text-muted-foreground text-sm">No goal created yet</p>
                <h3 className="mt-2 text-2xl font-semibold">Start with a target you can see every day.</h3>
                <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
                  Pick a timeline, set your amount, and this section will turn into a live progress tracker with your savings gap and completion status.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="mt-5">
                  <Target className="size-4" />
                  Create your first goal
                </Button>
              </div>

              <div className="bg-background rounded-xl border p-6">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                  Preview
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Progress bar</p>
                    <div className="bg-muted mt-2 h-4 rounded-full">
                      <div className="bg-primary h-full w-1/4 rounded-full opacity-80" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-xl border p-4">
                      <p className="text-muted-foreground text-sm">Target</p>
                      <p className="mt-1 text-lg font-semibold">100,000 RWF</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <p className="text-muted-foreground text-sm">Current</p>
                      <p className="mt-1 text-lg font-semibold">0 RWF</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <p className="text-muted-foreground text-sm">Timeline</p>
                      <p className="mt-1 text-lg font-semibold">6 months</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isSaving={isSaving}
        onSubmit={handleCreateGoal}
      />
    </>
  );
}
