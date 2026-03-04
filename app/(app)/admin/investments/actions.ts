"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createAdminInvestment,
  InvestmentsApiError,
} from "./lib/investments-api";
import {
  INVESTMENT_VEHICLE_TYPES,
  type CreateInvestmentInput,
  type Investment,
} from "./types";

const createInvestmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  vehicleType: z.enum(INVESTMENT_VEHICLE_TYPES, {
    message: "Vehicle type is required.",
  }),
  description: z.string().trim().min(1, "Description is required.").max(2000),
});

export type CreateInvestmentResult =
  | {
      ok: true;
      investment: Investment;
    }
  | {
      ok: false;
      message: string;
    };

export async function createInvestmentAction(
  input: unknown
): Promise<CreateInvestmentResult> {
  const parsed = createInvestmentSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    const errorMessage = firstError?.message || "Please check your input.";

    return {
      ok: false,
      message: errorMessage,
    };
  }

  try {
    const investment = await createAdminInvestment(
      parsed.data satisfies CreateInvestmentInput
    );
    revalidatePath("/admin/investment-accounts");

    return {
      ok: true,
      investment,
    };
  } catch (error) {
    if (error instanceof InvestmentsApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "Unable to create investment at the moment.",
    };
  }
}
