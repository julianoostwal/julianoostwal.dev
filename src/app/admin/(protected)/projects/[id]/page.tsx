import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Project
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update project details
        </p>
      </div>

      <ProjectForm project={project} />
    </div>
  );
}

