import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import IconCloud from "@/components/IconCloud";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { quixly, showQuixly } from "@/lib/quixly";

// Backstop only - the settings API revalidates this page on save.
export const revalidate = 3600;

export default async function HomePage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { siteName: true, heroTitle: true, heroSubtitle: true, socialLinks: true },
  });

  if (!settings) {
    notFound();
  }

  const socialLinks = settings.socialLinks as Record<string, string> | null;
  const withQuixly = showQuixly(settings.siteName);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] min-h-[calc(100dvh-4.5rem)] flex justify-center items-center px-4 py-8">
      <div className="container">
        <div className="flex flex-wrap gap-6 justify-evenly items-center">
          <div className="max-w-2xl gap-2 flex flex-col">
            <h1 className="text-2xl font-bold">{settings.heroTitle}</h1>
            <p>{settings.heroSubtitle}</p>
            {withQuixly && (
              <p className="text-gray-600 dark:text-gray-400">
                Founder of{" "}
                <a
                  href={quixly.url}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {quixly.name}
                </a>
                . {quixly.tagline}
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              {withQuixly && (
                <ButtonLink
                  color="secondary"
                  radius="full"
                  href={quixly.portfolioUrl}
                  target="_blank"
                  rel="noopener"
                >
                  View my work
                </ButtonLink>
              )}
              <ButtonLink color="primary" href="/contact">
                Contact Me
              </ButtonLink>
              {withQuixly && (
                <ButtonLink
                  color="default"
                  variant="bordered"
                  radius="full"
                  href={quixly.url}
                  target="_blank"
                  rel="noopener"
                >
                  Quixly Development
                </ButtonLink>
              )}
              {socialLinks?.github && (
                <ButtonLink
                  color="default"
                  radius="full"
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </ButtonLink>
              )}
            </div>
          </div>
          <IconCloud />
        </div>
      </div>
    </main>
  );
}
