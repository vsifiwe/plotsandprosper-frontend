import { requireRole } from "@/app/lib/auth";
import { SiteHeader } from "@/components/site-header";

export default async function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("member");

  return (
    <>
      <SiteHeader title="Member" />
      <div className="mx-auto min-h-screen w-full px-6 py-8">
        {children}
      </div>
    </>
  );
}
