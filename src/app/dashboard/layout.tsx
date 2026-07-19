import { Nav } from "@/components/nav";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <Nav userName={session?.name || session?.email || null} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}
