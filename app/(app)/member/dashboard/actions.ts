"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createMemberGoal, GoalApiError } from "./lib/goal-api";
import type { MemberGoal } from "./types";

const createGoalSchema = z.object({
  timeline: z.enum(["6_MONTHS", "1_YEAR", "2_YEARS", "5_YEARS", "10_YEARS"]),
  targetAmount: z
    .number({ coerce: true })
    .finite()
    .positive("Target amount must be greater than zero."),
});

export type CreateGoalResult =
  | {
      ok: true;
      goal: MemberGoal;
    }
  | {
      ok: false;
      message: string;
    };

export async function createGoalAction(input: unknown): Promise<CreateGoalResult> {
  const parsed = createGoalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please provide a valid timeline and target amount.",
    };
  }

  try {
    const goal = await createMemberGoal(parsed.data);
    revalidatePath("/member/dashboard");

    return {
      ok: true,
      goal,
    };
  } catch (error) {
    if (error instanceof GoalApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "Unable to create your goal at the moment.",
    };
  }
}
