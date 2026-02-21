"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createContribution,
  ContributionsApiError,
  type Contribution,
} from "./lib/contributions-api";

const createContributionSchema = z.object({
  memberId: z.string().trim().min(1, "Member is required."),
  windowId: z.number().int().positive("Contribution window is required."),
  amount: z.number().positive("Amount must be greater than zero."),
});

export type CreateContributionResult =
  | {
      ok: true;
      contribution: Contribution;
    }
  | {
      ok: false;
      message: string;
    };

export async function createContributionAction(
  input: unknown
): Promise<CreateContributionResult> {
  const parsed = createContributionSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      message: firstError?.message ?? "Please provide valid contribution details.",
    };
  }

  try {
    const contribution = await createContribution({
      memberId: parsed.data.memberId,
      windowId: parsed.data.windowId,
      amount: parsed.data.amount,
      recordedAt: new Date().toISOString(),
    });
    revalidatePath("/admin/contributions");

    return {
      ok: true,
      contribution,
    };
  } catch (error) {
    if (error instanceof ContributionsApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "Unable to create contribution at the moment.",
    };
  }
}
