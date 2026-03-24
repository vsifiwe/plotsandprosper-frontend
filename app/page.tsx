import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRightIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  UsersIcon,
  WalletIcon,
  TrendingUpIcon,
  LockKeyholeIcon,
  ReceiptTextIcon,
  ChevronRightIcon,
} from "lucide-react";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUpIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Plots & Prosper
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </a>
          <a
            href="#security"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Security
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth">
              Member Login
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,var(--primary)/8%,transparent)]" />

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Powering our group&apos;s financial future
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Grow your wealth,{" "}
            <span className="text-primary">together</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Our platform for tracking contributions, managing investments, and
            building a transparent financial future as a group.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth">
                Get Started
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <a href="#features">
                Learn More
                <ChevronRightIcon />
              </a>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {[
            { value: "100%", label: "Transparent" },
            { value: "24/7", label: "Access" },
            { value: "Real-time", label: "Tracking" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: WalletIcon,
    title: "Contribution Tracking",
    description:
      "Monitor every contribution in real-time. See your lifetime total, monthly progress, and cumulative growth at a glance.",
  },
  {
    icon: BarChart3Icon,
    title: "Investment Management",
    description:
      "Track investments, returns, and portfolio allocation. Full visibility into where your money is working.",
  },
  {
    icon: UsersIcon,
    title: "Group Transparency",
    description:
      "Every member sees the same numbers. Our group totals, membership metrics, and shared investment data — all in one place.",
  },
  {
    icon: ReceiptTextIcon,
    title: "Transaction History",
    description:
      "Complete audit trail of contributions, withdrawals, and penalties. Search, filter, and paginate through your history.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Role-Based Access",
    description:
      "Admins manage investments and members. Members track their own contributions. Everyone gets the right level of access.",
  },
  {
    icon: LockKeyholeIcon,
    title: "Secure by Design",
    description:
      "Strong authentication, tamper-proof financial records, and a full audit log. Your financial data is protected at every layer.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything our group needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From tracking contributions to managing investments, the platform
            handles the complexity so we can focus on growing together.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                <feature.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    title: "Sign in",
    description:
      "Log in with your member account to access your personal dashboard.",
  },
  {
    step: "02",
    title: "Make contributions",
    description:
      "Contribute on schedule. Track every payment and see your cumulative total grow.",
  },
  {
    step: "03",
    title: "Watch it grow",
    description:
      "Follow our investments, monitor returns, and see your share of the portfolio.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting started is simple. Three steps to financial clarity.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center md:text-left">
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-6 hidden h-px w-full translate-x-1/2 bg-border md:block" />
              )}
              <div className="relative mb-4 inline-flex size-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 md:flex-row md:gap-16">
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative flex size-32 items-center justify-center rounded-full bg-primary/10 sm:size-40">
              <ShieldCheckIcon className="size-16 text-primary sm:size-20" />
              <div className="absolute inset-0 animate-pulse rounded-full border-2 border-primary/20" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your finances, protected
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Every financial record is permanent — contributions, share
              allocations, and audit entries cannot be altered or deleted once
              created. Combined with secure authentication and access
              controls, our data stays safe and trustworthy.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              {[
                "Tamper-proof records",
                "Full audit trail",
                "Secure login",
                "Member & admin access",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control of your investments?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sign in to your member dashboard and start tracking your
            contributions and growth today.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/auth">
                Member Login
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary">
              <TrendingUpIcon className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Plots & Prosper</span>
          </div>

          <Separator className="sm:hidden" />

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Plots & Prosper. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SecuritySection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
