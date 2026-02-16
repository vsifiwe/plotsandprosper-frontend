import { requireRoles } from "@/app/lib/auth";

export default async function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRoles(["member", "admin"]);
  const sectionTitle = session.role === "admin" ? "My Account" : "Member";

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{sectionTitle}</h1>
      </header>
      {children}
    </div>
  );
}
