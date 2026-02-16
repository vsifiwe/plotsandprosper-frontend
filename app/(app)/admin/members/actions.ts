"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminMember, MembersApiError } from "./lib/members-api";
import { type Member } from "./types";

const createMemberSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phoneNumber: z.string().trim().min(1, "Phone number is required.").max(30),
  nid: z.string().trim().min(1, "National ID is required.").max(30),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Join date is invalid."),
});

export type CreateMemberResult =
  | {
      ok: true;
      member: Member;
    }
  | {
      ok: false;
      message: string;
    };

export async function createMemberAction(
  input: unknown
): Promise<CreateMemberResult> {
  const parsed = createMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please provide valid member details.",
    };
  }

  try {
    const member = await createAdminMember(parsed.data);
    revalidatePath("/admin/members");

    return {
      ok: true,
      member,
    };
  } catch (error) {
    if (error instanceof MembersApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "Unable to create member at the moment.",
    };
  }
}
