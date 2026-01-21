import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your site settings and content
        </p>
      </div>

      <SettingsForm
        settings={{
          ...settings,
          socialLinks: settings.socialLinks as Record<string, string> | null,
        }}
      />
    </div>
  );
}
