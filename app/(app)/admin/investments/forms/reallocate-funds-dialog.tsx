"use client";

import { FormEvent, useState } from "react";
import { ArrowRightLeft, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Investment, type ReallocateFundsInput } from "../types";

type ReallocateFundsDialogProps = {
  investments: Investment[];
  isSaving: boolean;
  onSubmit: (input: ReallocateFundsInput) => Promise<void>;
};

type ReallocateFundsFormState = {
  sourceVehicle: string;
  destinationVehicle: string;
  amount: string;
};

const INITIAL_FORM_STATE: ReallocateFundsFormState = {
  sourceVehicle: "",
  destinationVehicle: "",
  amount: "",
};

export function ReallocateFundsDialog({
  investments,
  isSaving,
  onSubmit,
}: ReallocateFundsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<ReallocateFundsFormState>(INITIAL_FORM_STATE);

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
    setSubmitError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isSaving) {
      resetForm();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const sourceId = Number.parseInt(formState.sourceVehicle, 10);
    const destinationId = Number.parseInt(formState.destinationVehicle, 10);

    if (!Number.isFinite(sourceId) || sourceId <= 0) {
      setSubmitError("Please select a source vehicle.");
      return;
    }

    if (!Number.isFinite(destinationId) || destinationId <= 0) {
      setSubmitError("Please select a destination vehicle.");
      return;
    }

    if (sourceId === destinationId) {
      setSubmitError("Source and destination vehicles must be different.");
      return;
    }

    try {
      await onSubmit({
        sourceVehicle: sourceId,
        destinationVehicle: destinationId,
        amount: formState.amount.trim(),
      });

      setIsOpen(false);
      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to reallocate funds at the moment."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <ArrowRightLeft />
          Reallocate Funds
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reallocate Funds</DialogTitle>
          <DialogDescription>
            Move funds from one investment vehicle to another.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="reallocate-source">Source Vehicle</Label>
            <Select
              value={formState.sourceVehicle}
              onValueChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  sourceVehicle: value,
                }))
              }
            >
              <SelectTrigger id="reallocate-source">
                <SelectValue placeholder="Select source vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {investments.map((investment) => (
                    <SelectItem
                      key={investment.id}
                      value={String(investment.id)}
                    >
                      {investment.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reallocate-destination">Destination Vehicle</Label>
            <Select
              value={formState.destinationVehicle}
              onValueChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  destinationVehicle: value,
                }))
              }
            >
              <SelectTrigger id="reallocate-destination">
                <SelectValue placeholder="Select destination vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {investments.map((investment) => (
                    <SelectItem
                      key={investment.id}
                      value={String(investment.id)}
                    >
                      {investment.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reallocate-amount">Amount</Label>
            <Input
              id="reallocate-amount"
              type="number"
              required
              min="0"
              step="any"
              placeholder="e.g. 1000"
              value={formState.amount}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
            />
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
                  Reallocating...
                </>
              ) : (
                "Reallocate Funds"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
