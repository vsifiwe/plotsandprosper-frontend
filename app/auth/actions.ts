"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getDashboardPathByRole } from "@/app/lib/auth";
import { clearAuthCookies, setAuthCookies } from "@/app/lib/auth-cookies";
import { BackendApiError, loginWithUsernameAndPassword } from "@/app/lib/backend-api";
import type { AuthSession } from "@/app/lib/auth-types";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .max(150, "Username is too long."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(100, "Password is too long."),
});

type LoginFieldErrors = {
  username?: string[];
  password?: string[];
};

export type LoginFormState = {
  errors?: LoginFieldErrors;
  fields?: {
    username: string;
  };
  message?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const rawInput = {
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      fields: {
        username: rawInput.username,
      },
      message: "Fix the validation errors and try again.",
    };
  }

  let session: AuthSession;
  try {
    session = await loginWithUsernameAndPassword(parsed.data);
    console.log("session", session);
  } catch (error) {
    console.error(error);
    return {
      fields: {
        username: parsed.data.username,
      },
      message:
        error instanceof BackendApiError
          ? error.message
          : "Unable to sign in right now. Please try again.",
    };
  }

  console.log("session", session);

  await setAuthCookies(session);

  redirect(getDashboardPathByRole(session.role));
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect("/auth");
}
