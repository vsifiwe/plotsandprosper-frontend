"use client";

import { useState } from "react";

import { createMemberAction } from "../actions";
import { AddMemberDialog } from "../forms/add-member-dialog";
import { CreateMemberInput, Member } from "../types";
import { MembersList } from "./members-list";

type AdminMembersClientProps = {
  initialMembers: Member[];
  loadError: string | null;
};

export function AdminMembersClient({
  initialMembers,
  loadError,
}: AdminMembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isSavingMember, setIsSavingMember] = useState(false);

  const handleCreateMember = async (memberData: CreateMemberInput) => {
    setIsSavingMember(true);

    try {
      const result = await createMemberAction(memberData);
      if (!result.ok) {
        throw new Error(result.message);
      }

      setMembers((current) => [result.member, ...current]);
    } finally {
      setIsSavingMember(false);
    }
  };

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Members</h2>
          <p className="text-sm text-zinc-600">All registered scheme members</p>
        </div>
        <AddMemberDialog isSaving={isSavingMember} onSubmit={handleCreateMember} />
      </div>

      {loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <MembersList members={members} />
    </main>
  );
}
