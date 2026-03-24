import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/app/auth/auth-form";
import { getCurrentSession, getDashboardPathByRole } from "@/app/lib/auth";
import {
  TrendingUpIcon,
  WalletIcon,
  BarChart3Icon,
  ShieldCheckIcon,
} from "lucide-react";

export default async function AuthPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(getDashboardPathByRole(session.role));
  }

  return (
    <main className="flex min-h-screen w-full">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_80%,oklch(1_0_0/8%),transparent)]" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/20 backdrop-blur-sm">
              <TrendingUpIcon className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary-foreground">
              Plots & Prosper
            </span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <blockquote className="max-w-md space-y-3">
            <p className="text-2xl font-semibold leading-snug text-primary-foreground">
              Track contributions, manage investments, and grow together.
            </p>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Your personal dashboard gives you full visibility into your
              contributions, group performance, and investment portfolio.
            </p>
          </blockquote>

          <div className="flex gap-6">
            {[
              { icon: WalletIcon, label: "Contributions" },
              { icon: BarChart3Icon, label: "Investments" },
              { icon: ShieldCheckIcon, label: "Secure" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary-foreground/15 backdrop-blur-sm">
                  <item.icon className="size-4 text-primary-foreground/80" />
                </div>
                <span className="text-xs font-medium text-primary-foreground/70">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} Plots & Prosper
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUpIcon className="size-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Plots & Prosper
            </span>
          </Link>
        </div>

        {/* Desktop top-right link */}
        <div className="hidden items-center justify-end px-10 pt-8 lg:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access your member dashboard
              </p>
            </div>

            <AuthForm />

            <p className="text-center text-xs text-muted-foreground lg:text-left">
              Don&apos;t have an account? Contact your group admin to get
              started.
            </p>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="px-6 pb-6 text-center lg:hidden">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Plots & Prosper
          </p>
        </div>
      </div>
    </main>
  );
}
