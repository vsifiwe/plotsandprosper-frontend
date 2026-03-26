"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, TargetIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GOAL_TIMELINES, type CreateMemberGoalInput, type GoalTimeline } from "../types";

type CreateGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSubmit: (goal: CreateMemberGoalInput) => Promise<void>;
};

type GoalFormState = {
  timeline: GoalTimeline;
  targetAmount: string;
};

const INITIAL_FORM_STATE: GoalFormState = {
  timeline: "6_MONTHS",
  targetAmount: "",
};

function formatTimelineLabel(timeline: GoalTimeline): string {
  switch (timeline) {
    case "3_MONTHS":
      return "3 months";
    case "6_MONTHS":
      return "6 months";
    case "1_YEAR":
      return "1 year";
  }
}

export function CreateGoalDialog({
  open,
  onOpenChange,
  isSaving,
  onSubmit,
}: CreateGoalDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formState, setFormState] = useState<GoalFormState>(INITIAL_FORM_STATE);

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
    setSubmitError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen && !isSaving) {
      resetForm();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      await onSubmit({
        timeline: formState.timeline,
        targetAmount: Number(formState.targetAmount),
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to create your goal at the moment."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TargetIcon className="size-5" />
            Create Savings Goal
          </DialogTitle>
          <DialogDescription>
            Set a target and timeline so you can track how close you are each time you return.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="goal-timeline">Timeline</Label>
            <Select
              value={formState.timeline}
              onValueChange={(value: GoalTimeline) =>
                setFormState((current) => ({
                  ...current,
                  timeline: value,
                }))
              }
            >
              <SelectTrigger id="goal-timeline">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_TIMELINES.map((timeline) => (
                  <SelectItem key={timeline} value={timeline}>
                    {formatTimelineLabel(timeline)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target-amount">Target amount</Label>
            <Input
              id="goal-target-amount"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="100000"
              required
              value={formState.targetAmount}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  targetAmount: event.target.value,
                }))
              }
            />
            <p className="text-muted-foreground text-xs">
              Enter the amount you want to save in RWF.
            </p>
          </div>

          {submitError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
