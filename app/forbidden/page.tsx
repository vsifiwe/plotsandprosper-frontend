import Link from "next/link";

import { getCurrentSession, getDashboardPathByRole } from "@/app/lib/auth";

export default async function ForbiddenPage() {
  const session = await getCurrentSession();
  const returnPath = session ? getDashboardPathByRole(session.role) : "/auth";
  const returnLabel = session ? "Go to your dashboard" : "Go to sign in";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold tracking-wide text-zinc-500">403</p>
      <h1 className="text-3xl font-bold">Forbidden</h1>
      <p className="text-zinc-600">
        You do not have permission to access this page.
      </p>
      <Link
        href={returnPath}
        className="mt-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-100"
      >
        {returnLabel}
      </Link>
    </main>
  );
}
