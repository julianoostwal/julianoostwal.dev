import { prisma } from "@/lib/db/prisma";
import { Card, CardBody } from "@heroui/card";
import { FolderKanban, Settings } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const projectCount = await prisma.project.count();

  const stats = [
    {
      title: "Total Projects",
      value: projectCount,
      icon: FolderKanban,
      href: "/admin/projects",
      color: "bg-blue-500",
    },
    {
      title: "Settings",
      value: "→",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to your admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
