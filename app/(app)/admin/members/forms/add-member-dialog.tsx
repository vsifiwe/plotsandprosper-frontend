"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

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

import { CreateMemberInput } from "../types";

type AddMemberDialogProps = {
  isSaving: boolean;
  onSubmit: (member: CreateMemberInput) => Promise<void>;
};

const today = new Date().toISOString().slice(0, 10);

const EMPTY_FORM: CreateMemberInput = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  nid: "",
  joinDate: today,
};

export function AddMemberDialog({ isSaving, onSubmit }: AddMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMemberInput>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      ...EMPTY_FORM,
      joinDate: new Date().toISOString().slice(0, 10),
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isSaving) {
      resetForm();
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      await onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        nid: formData.nid.trim(),
        joinDate: formData.joinDate,
      });

      setIsOpen(false);
      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to create member at the moment."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus />
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill all details to register a member profile.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nid">NID</Label>
              <Input
                id="nid"
                required
                value={formData.nid}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    nid: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="joinDate">Join date</Label>
              <Input
                id="joinDate"
                type="date"
                required
                value={formData.joinDate}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    joinDate: event.target.value,
                  }))
                }
              />
            </div>
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
                "Create Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
