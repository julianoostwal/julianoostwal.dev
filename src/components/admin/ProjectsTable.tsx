"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Edit, Trash2, Eye, EyeOff, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  published: boolean;
  featured: boolean;
  createdAt: Date;
}

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    setLoading(id);
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      
      toast.success("Project deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setLoading(null);
    }
  }

  async function togglePublished(id: string, published: boolean) {
    setLoading(id);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      if (!response.ok) throw new Error("Update failed");
      
      toast.success(published ? "Project unpublished" : "Project published");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setLoading(null);
    }
  }

  async function toggleFeatured(id: string, featured: boolean) {
    setLoading(id);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      if (!response.ok) throw new Error("Update failed");
      
      toast.success(featured ? "Removed from featured" : "Added to featured");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setLoading(null);
    }
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardBody className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
          <Button as={Link} href="/admin/projects/new" color="primary" className="mt-4">
            Create your first project
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Project</th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Created</th>
                <th className="text-right p-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {project.imageUrl && (
                        <div className="relative w-12 h-12">
                          <Image
                            src={project.imageUrl}
                            alt={project.title}
                            fill
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{project.title}</p>
                        <p className="text-sm text-gray-500">/{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={project.published ? "success" : "default"}
                        variant="flat"
                      >
                        {project.published ? "Published" : "Draft"}
                      </Chip>
                      {project.featured && (
                        <Chip size="sm" color="warning" variant="flat">
                          Featured
                        </Chip>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {project.liveUrl && (
                        <Button
                          as="a"
                          href={project.liveUrl}
                          target="_blank"
                          size="sm"
                          variant="light"
                          isIconOnly
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={() => toggleFeatured(project.id, project.featured)}
                        isLoading={loading === project.id}
                      >
                        <Star className={`w-4 h-4 ${project.featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={() => togglePublished(project.id, project.published)}
                        isLoading={loading === project.id}
                      >
                        {project.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        as={Link}
                        href={`/admin/projects/${project.id}`}
                        size="sm"
                        variant="light"
                        isIconOnly
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        onClick={() => handleDelete(project.id)}
                        isLoading={loading === project.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
