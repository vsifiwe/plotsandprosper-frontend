"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CreateContributionWindowInput } from "../types";

type ContributionWindowFormProps = {
  isSaving: boolean;
  onSubmit: (data: CreateContributionWindowInput) => Promise<void>;
  onCancel?: () => void;
};

const EMPTY_FORM: CreateContributionWindowInput = {
  name: "",
  start_at: "",
  end_at: "",
  min_amount: 0,
};

export function ContributionWindowForm({
  isSaving,
  onSubmit,
  onCancel,
}: ContributionWindowFormProps) {
  const [formData, setFormData] = useState<CreateContributionWindowInput>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    // Convert date inputs to ISO 8601 format with time
    const startDate = new Date(formData.start_at);
    const endDate = new Date(formData.end_at);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setSubmitError("Please provide valid dates.");
      return;
    }

    if (endDate <= startDate) {
      setSubmitError("End date must be after start date.");
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
        min_amount: formData.min_amount,
      });

      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to create contribution window at the moment."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          placeholder="e.g., 25 Feb - 05 March"
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          disabled={isSaving}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_at">Start Date</Label>
          <Input
            id="start_at"
            type="datetime-local"
            required
            value={formData.start_at}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                start_at: event.target.value,
              }))
            }
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_at">End Date</Label>
          <Input
            id="end_at"
            type="datetime-local"
            required
            value={formData.end_at}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                end_at: event.target.value,
              }))
            }
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="min_amount">Minimum Amount (RWF)</Label>
        <Input
          id="min_amount"
          type="number"
          required
          min="0"
          step="1"
          value={formData.min_amount || ""}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              min_amount: parseFloat(event.target.value) || 0,
            }))
          }
          disabled={isSaving}
        />
      </div>

      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <LoaderCircle className="animate-spin" />
              Creating...
            </>
          ) : (
            "Create Window"
          )}
        </Button>
      </div>
    </form>
  );
}
