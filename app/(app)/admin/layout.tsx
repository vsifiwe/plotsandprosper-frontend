import { requireRole } from "@/app/lib/auth";
import { SiteHeader } from "@/components/site-header";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("admin");

  return (
    <>
    <SiteHeader title="Admin" />
    <div className="mx-auto min-h-screen w-full px-6 py-8">
      {children}
    </div>
    </>
  );
}
