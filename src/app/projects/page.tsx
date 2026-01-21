import { prisma } from "@/lib/db/prisma";
import { MotionDiv } from "@/lib/framer-motion-div";
import { IoIosArrowRoundForward } from "react-icons/io";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Chip } from "@heroui/chip";
import type { Metadata } from "next";
import Image from "next/image";
import { generateSiteMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata({
    title: "Projects",
    pathname: "/projects",
  });
}

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Projects() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <main className="min-h-screen">
      <div className="container py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A collection of web applications and projects I&apos;ve built using modern technologies.
          </p>
        </header>

        {projects.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-20">
            <p className="text-lg">No projects available yet.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <MotionDiv
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <article className="h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  {/* Image */}
                  {project.imageUrl && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {project.featured && (
                        <div className="absolute top-3 right-3">
                          <Chip size="sm" color="warning" variant="solid">
                            Featured
                          </Chip>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {project.title}
                    </h2>

                    {/* Technologies */}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <Chip key={tech} size="sm" variant="flat" className="text-xs">
                            {tech}
                          </Chip>
                        ))}
                        {project.technologies.length > 4 && (
                          <Chip size="sm" variant="flat" className="text-xs">
                            +{project.technologies.length - 4}
                          </Chip>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {project.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                        {project.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <ButtonLink
                        href={`/projects/${project.slug}`}
                        size="sm"
                        variant="flat"
                        color="primary"
                      >
                        Learn More
                      </ButtonLink>
                      {project.liveUrl && (
                        <ButtonLink
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          color="primary"
                          endContent={<IoIosArrowRoundForward size={20} />}
                        >
                          View Live
                        </ButtonLink>
                      )}
                    </div>
                  </div>
                </article>
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
