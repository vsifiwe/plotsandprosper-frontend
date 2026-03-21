"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createAdminInvestment,
  createFundReallocation,
  createInvestmentEvent,
  InvestmentsApiError,
} from "./lib/investments-api";
import {
  INVESTMENT_VEHICLE_TYPES,
  type CreateInvestmentInput,
  type InvestFundsInput,
  type Investment,
  type ReallocateFundsInput,
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

const investFundsSchema = z.object({
  shares: z.string().trim().min(1, "Shares is required."),
  sharePrice: z.string().trim().min(1, "Share price is required."),
  investmentVehicle: z.number().int().positive("Investment vehicle is required."),
  notes: z.string().trim().max(2000).default(""),
});

export type InvestFundsResult =
  | { ok: true }
  | { ok: false; message: string };

export async function investFundsAction(
  input: unknown
): Promise<InvestFundsResult> {
  const parsed = investFundsSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      message: firstError?.message || "Please check your input.",
    };
  }

  try {
    await createInvestmentEvent(parsed.data satisfies InvestFundsInput);
    revalidatePath("/admin/investment-accounts");
    return { ok: true };
  } catch (error) {
    if (error instanceof InvestmentsApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Unable to invest funds at the moment." };
  }
}

const reallocateFundsSchema = z.object({
  sourceVehicle: z.number().int().positive("Source vehicle is required."),
  destinationVehicle: z.number().int().positive("Destination vehicle is required."),
  amount: z.string().trim().min(1, "Amount is required."),
});

export type ReallocateFundsResult =
  | { ok: true }
  | { ok: false; message: string };

export async function reallocateFundsAction(
  input: unknown
): Promise<ReallocateFundsResult> {
  const parsed = reallocateFundsSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      message: firstError?.message || "Please check your input.",
    };
  }

  try {
    await createFundReallocation(parsed.data satisfies ReallocateFundsInput);
    revalidatePath("/admin/investment-accounts");
    return { ok: true };
  } catch (error) {
    if (error instanceof InvestmentsApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "Unable to reallocate funds at the moment." };
  }
}
