"use client";

import { FormEvent, useState } from "react";
import { DollarSign, LoaderCircle } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

import { type InvestFundsInput, type Investment } from "../types";

type InvestFundsDialogProps = {
  investments: Investment[];
  isSaving: boolean;
  onSubmit: (input: InvestFundsInput) => Promise<void>;
};

type InvestFundsFormState = {
  shares: string;
  sharePrice: string;
  investmentVehicle: string;
  notes: string;
};

const INITIAL_FORM_STATE: InvestFundsFormState = {
  shares: "",
  sharePrice: "",
  investmentVehicle: "",
  notes: "",
};

export function InvestFundsDialog({
  investments,
  isSaving,
  onSubmit,
}: InvestFundsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<InvestFundsFormState>(INITIAL_FORM_STATE);

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

    const vehicleId = Number.parseInt(formState.investmentVehicle, 10);
    if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
      setSubmitError("Please select an investment vehicle.");
      return;
    }

    try {
      await onSubmit({
        shares: formState.shares.trim(),
        sharePrice: formState.sharePrice.trim(),
        investmentVehicle: vehicleId,
        notes: formState.notes.trim(),
      });

      setIsOpen(false);
      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to invest funds at the moment."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <DollarSign />
          Invest Funds
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Invest Unallocated Funds</DialogTitle>
          <DialogDescription>
            Allocate unallocated funds to an investment vehicle.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="invest-vehicle">Investment Vehicle</Label>
            <Select
              value={formState.investmentVehicle}
              onValueChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  investmentVehicle: value,
                }))
              }
            >
              <SelectTrigger id="invest-vehicle">
                <SelectValue placeholder="Select investment vehicle" />
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
            <Label htmlFor="invest-shares">Shares</Label>
            <Input
              id="invest-shares"
              type="number"
              required
              min="0"
              step="any"
              placeholder="e.g. 3"
              value={formState.shares}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  shares: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invest-share-price">Share Price</Label>
            <Input
              id="invest-share-price"
              type="number"
              required
              min="0"
              step="any"
              placeholder="e.g. 440"
              value={formState.sharePrice}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  sharePrice: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invest-notes">Notes</Label>
            <Textarea
              id="invest-notes"
              placeholder="Optional notes about this investment"
              value={formState.notes}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  notes: event.target.value,
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
                  Investing...
                </>
              ) : (
                "Invest Funds"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
