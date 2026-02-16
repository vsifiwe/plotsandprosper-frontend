"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CreateContributionWindowInput } from "../types";
import { ContributionWindowForm } from "./contribution-window-form";

type AddContributionWindowDialogProps = {
  isSaving: boolean;
  onSubmit: (window: CreateContributionWindowInput) => Promise<void>;
};

export function AddContributionWindowDialog({
  isSaving,
  onSubmit,
}: AddContributionWindowDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: CreateContributionWindowInput) => {
    await onSubmit(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus />
          Add Window
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Contribution Window</DialogTitle>
          <DialogDescription>
            Create a new contribution window with start and end dates.
          </DialogDescription>
        </DialogHeader>

        <ContributionWindowForm
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
