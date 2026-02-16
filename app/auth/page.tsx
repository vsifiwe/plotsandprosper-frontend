import { redirect } from "next/navigation";

import { AuthForm } from "@/app/auth/auth-form";
import { getCurrentSession, getDashboardPathByRole } from "@/app/lib/auth";

export default async function AuthPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(getDashboardPathByRole(session.role));
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-center">Sign in</h1>
          <p className="text-sm text-zinc-600 text-center">
            Use your account to continue to your dashboard.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
