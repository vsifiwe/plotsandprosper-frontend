"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createContributionWindow,
  ContributionWindowsApiError,
} from "./lib/contribution-windows-api";
import { type ContributionWindow } from "./types";

const createContributionWindowSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Name is too long (max 200 characters)."),
  start_at: z.string().min(1, "Start date is required."),
  end_at: z.string().min(1, "End date is required."),
  min_amount: z.number().positive("Minimum amount must be greater than zero."),
});

export type CreateContributionWindowResult =
  | {
      ok: true;
      window: ContributionWindow;
    }
  | {
      ok: false;
      message: string;
    };

export async function createContributionWindowAction(
  input: unknown
): Promise<CreateContributionWindowResult> {
  const parsed = createContributionWindowSchema.safeParse(input);
  if (!parsed.success) {
    // Get the first error message to show to the user
    const firstError = parsed.error.issues[0];
    const errorMessage = firstError?.message || "Please check your input and try again.";

    return {
      ok: false,
      message: errorMessage,
    };
  }

  try {
    const window = await createContributionWindow(parsed.data);
    revalidatePath("/admin/contribution-window");

    return {
      ok: true,
      window,
    };
  } catch (error) {
    if (error instanceof ContributionWindowsApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "Unable to create contribution window at the moment.",
    };
  }
}
