import { prisma } from "@/lib/db/prisma";
import ProjectsTable from "@/components/admin/ProjectsTable";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Plus } from "lucide-react";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your portfolio projects
          </p>
        </div>
        <ButtonLink
          href="/admin/projects/new"
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
        >
          New Project
        </ButtonLink>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  );
}
