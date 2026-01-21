import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { generateSiteMetadata, generateProjectSchema } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Chip } from "@heroui/chip";
import Image from "next/image";
import Script from "next/script";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { slug: true, id: true },
  });

  return projects.map((project) => ({
    slug: project.slug || project.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Find by slug first, then by id
  const project = await prisma.project.findFirst({
    where: {
      published: true,
      OR: [
        { slug },
        { id: slug },
      ],
    },
  });

  if (!project) {
    return generateSiteMetadata({ title: "Project Not Found", noIndex: true });
  }

  return generateSiteMetadata({
    title: project.title,
    description: project.description || undefined,
    image: project.imageUrl || undefined,
    pathname: `/projects/${project.slug || project.id}`,
    noIndex: project.noIndex,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  // Find by slug first, then by id
  const project = await prisma.project.findFirst({
    where: {
      published: true,
      OR: [
        { slug },
        { id: slug },
      ],
    },
  });

  if (!project) {
    notFound();
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { siteName: true },
  });

  return (
    <>
      <Script
        id={`schema-project-${project.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProjectSchema({
            title: project.title,
            description: project.description || "",
            slug: project.slug || project.id,
            imageUrl: project.imageUrl || undefined,
            liveUrl: project.liveUrl || undefined,
            technologies: project.technologies,
            createdAt: project.createdAt,
            authorName: settings?.siteName ?? undefined,
          })),
        }}
      />
      <main className="min-h-screen">
        <div className="container py-8">
          {/* Back Button */}
          <ButtonLink
            href="/projects"
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="mb-6"
          >
            Back to Projects
          </ButtonLink>

          <article>
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <Chip key={tech} size="sm" variant="flat">
                      {tech}
                    </Chip>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                {project.liveUrl && (
                  <ButtonLink
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    startContent={<ExternalLink className="w-4 h-4" />}
                  >
                    View Live
                  </ButtonLink>
                )}
                {project.githubUrl && (
                  <ButtonLink
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="bordered"
                    startContent={<Github className="w-4 h-4" />}
                  >
                    View Source
                  </ButtonLink>
                )}
              </div>
            </header>

            {/* Image */}
            {project.imageUrl && (
              <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden max-w-4xl">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Description */}
            {project.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {project.description}
              </p>
            )}

            {/* Content */}
            {project.content && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {project.content.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </article>
        </div>
      </main>
    </>
  );
}
