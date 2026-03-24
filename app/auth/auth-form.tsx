"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, EyeIcon, EyeOffIcon, LockKeyholeIcon } from "lucide-react";

import { loginAction, type LoginFormState } from "@/app/auth/actions";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

export function AuthForm() {
  const initialState: LoginFormState = {};
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState<
    LoginFormState,
    FormData
  >(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <UserIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            defaultValue={state.fields?.username}
            aria-invalid={Boolean(state.errors?.username?.[0])}
            disabled={isPending}
            className="pl-9"
            required
          />
        </div>
        <FieldError message={state.errors?.username?.[0]} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockKeyholeIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(state.errors?.password?.[0])}
            disabled={isPending}
            className="pl-9 pr-9"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
        <FieldError message={state.errors?.password?.[0]} />
      </div>

      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
