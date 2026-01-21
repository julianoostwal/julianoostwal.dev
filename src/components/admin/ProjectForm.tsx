"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  technologies: string[];
  featured: boolean;
  published: boolean;
  noIndex: boolean;
  sortOrder: number;
}

interface ProjectFormProps {
  project?: Project;
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: project?.title || "",
    slug: project?.slug || "",
    description: project?.description || "",
    content: project?.content || "",
    imageUrl: project?.imageUrl || "",
    liveUrl: project?.liveUrl || "",
    githubUrl: project?.githubUrl || "",
    technologies: project?.technologies.join(", ") || "",
    featured: project?.featured || false,
    published: project?.published || false,
    noIndex: project?.noIndex || false,
    sortOrder: project?.sortOrder || 0,
  });


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        technologies: formData.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = project ? `/api/projects/${project.id}` : "/api/projects";
      const method = project ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save project");
      }

      toast.success(project ? "Project updated" : "Project created");
      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody className="space-y-6 p-6">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
                variant="bordered"
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                variant="bordered"
                placeholder={project ? undefined : "Leave empty to auto-generate from ID"}
                description={project ? "URL identifier" : "Leave empty to use database ID"}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="bordered"
                rows={3}
              />
              <Textarea
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                variant="bordered"
                rows={8}
                description="Full project description (supports markdown)"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6 p-6">
              <h3 className="font-semibold text-lg">Links</h3>
              <Input
                label="Live URL"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                variant="bordered"
                placeholder="https://example.com"
              />
              <Input
                label="GitHub URL"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                variant="bordered"
                placeholder="https://github.com/username/repo"
              />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-6 p-6">
              <h3 className="font-semibold text-lg">Publish</h3>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Published</span>
                <Switch
                  isSelected={formData.published}
                  onValueChange={(value) => setFormData({ ...formData, published: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Featured</span>
                <Switch
                  isSelected={formData.featured}
                  onValueChange={(value) => setFormData({ ...formData, featured: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground">No Index</span>
                  <p className="text-xs text-muted-foreground">Hide from search engines (for client projects)</p>
                </div>
                <Switch
                  isSelected={formData.noIndex}
                  onValueChange={(value) => setFormData({ ...formData, noIndex: value })}
                />
              </div>
              <Input
                label="Sort Order"
                type="number"
                value={formData.sortOrder.toString()}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                variant="bordered"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6 p-6">
              <h3 className="font-semibold text-lg">Image</h3>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6 p-6">
              <h3 className="font-semibold text-lg">Technologies</h3>
              <Input
                label="Technologies"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                variant="bordered"
                description="Comma-separated list"
                placeholder="React, Next.js, TypeScript"
              />
            </CardBody>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="bordered"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              className="flex-1"
              isLoading={loading}
            >
              {project ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
