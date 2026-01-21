import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          New Project
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new portfolio project
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}

