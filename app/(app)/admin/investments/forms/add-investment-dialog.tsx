"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";

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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  formatVehicleType,
  INVESTMENT_VEHICLE_TYPES,
  type CreateInvestmentInput,
  type InvestmentVehicleType,
} from "../types";

type AddInvestmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSubmit: (investment: CreateInvestmentInput) => Promise<void>;
};

type InvestmentFormState = {
  name: string;
  vehicleType: InvestmentVehicleType;
  description: string;
};

const INITIAL_FORM_STATE: InvestmentFormState = {
  name: "",
  vehicleType: "SAVINGS_ACCOUNT",
  description: "",
};

export function AddInvestmentDialog({
  open,
  onOpenChange,
  isSaving,
  onSubmit,
}: AddInvestmentDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formState, setFormState] = useState<InvestmentFormState>(
    INITIAL_FORM_STATE
  );

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
        name: formState.name.trim(),
        vehicleType: formState.vehicleType,
        description: formState.description.trim(),
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to create investment at the moment."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Investment</DialogTitle>
          <DialogDescription>
            Add a new investment vehicle and description.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="investment-name">Name</Label>
            <Input
              id="investment-name"
              required
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment-vehicle-type">Vehicle type</Label>
            <Select
              value={formState.vehicleType}
              onValueChange={(value: InvestmentVehicleType) =>
                setFormState((current) => ({
                  ...current,
                  vehicleType: value,
                }))
              }
            >
              <SelectTrigger id="investment-vehicle-type">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {INVESTMENT_VEHICLE_TYPES.map((vehicleType) => (
                    <SelectItem key={vehicleType} value={vehicleType}>
                      {formatVehicleType(vehicleType)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment-description">Description</Label>
            <Textarea
              id="investment-description"
              required
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
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
                  Saving...
                </>
              ) : (
                "Create investment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
