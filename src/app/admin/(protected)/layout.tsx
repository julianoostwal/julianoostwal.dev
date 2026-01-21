import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <>
      {/* Hide navbar and footer for admin */}
      <style>{`
        body > div > nav,
        body > div > footer { display: none !important; }
      `}</style>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">{children}</main>
      </div>
    </>
  );
}

