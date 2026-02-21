"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { createContributionAction } from "../actions";
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

type ContributionMemberOption = {
  id: string;
  name: string;
};

type ContributionWindowOption = {
  id: number;
  name: string;
};

type AddContributionDialogProps = {
  members: ContributionMemberOption[];
  windows: ContributionWindowOption[];
  optionsLoadError: string | null;
};

type ContributionFormData = {
  memberId: string;
  windowId: string;
  amount: string;
};

const EMPTY_FORM: ContributionFormData = {
  memberId: "",
  windowId: "",
  amount: "",
};

export function AddContributionDialog({
  members,
  windows,
  optionsLoadError,
}: AddContributionDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContributionFormData>(EMPTY_FORM);

  const formUnavailable =
    !!optionsLoadError || members.length === 0 || windows.length === 0;

  const resetForm = () => {
    setFormData(EMPTY_FORM);
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

    const windowId = Number.parseInt(formData.windowId, 10);
    const amount = Number.parseFloat(formData.amount);
    if (
      !formData.memberId ||
      !Number.isFinite(windowId) ||
      windowId < 1 ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setSubmitError("Select member and window, then enter a valid amount.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createContributionAction({
        memberId: formData.memberId,
        windowId,
        amount,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to create contribution at the moment."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" disabled={formUnavailable}>
          <Plus />
          Log new contribution
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log New Contribution</DialogTitle>
          <DialogDescription>
            Select member, contribution window, and amount to save the contribution.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-id">Member</Label>
              <Select
                value={formData.memberId}
                onValueChange={(value) =>
                  setFormData((current) => ({ ...current, memberId: value }))
                }
                disabled={formUnavailable}
              >
                <SelectTrigger id="member-id">
                  <SelectValue placeholder="Select member name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="window-id">Contribution window</Label>
              <Select
                value={formData.windowId}
                onValueChange={(value) =>
                  setFormData((current) => ({ ...current, windowId: value }))
                }
                disabled={formUnavailable}
              >
                <SelectTrigger id="window-id">
                  <SelectValue placeholder="Select contribution window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {windows.map((window) => (
                      <SelectItem key={window.id} value={String(window.id)}>
                        {window.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formData.amount}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                disabled={formUnavailable || isSaving}
              />
            </div>
          </div>

          {optionsLoadError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {optionsLoadError}
            </p>
          ) : null}

          {!optionsLoadError && members.length === 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No members available.
            </p>
          ) : null}

          {!optionsLoadError && windows.length === 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No contribution windows available.
            </p>
          ) : null}

          {submitError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isSaving || formUnavailable}>
              {isSaving ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save contribution"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
