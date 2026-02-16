"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  loginAction,
  type LoginFormState,
} from "@/app/auth/actions";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

export function AuthForm() {
  const initialState: LoginFormState = {};

  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          defaultValue={state.fields?.username}
          aria-invalid={Boolean(state.errors?.username?.[0])}
          disabled={isPending}
          required
        />
        <FieldError message={state.errors?.username?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={Boolean(state.errors?.password?.[0])}
          disabled={isPending}
          required
        />
        <FieldError message={state.errors?.password?.[0]} />
      </div>

      {state.message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
