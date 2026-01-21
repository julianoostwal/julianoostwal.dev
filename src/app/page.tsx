import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import IconCloud from "@/components/IconCloud";
import { ButtonLink } from "@/components/ui/ButtonLink";

// Revalidate every 60 seconds - updates from dashboard will show within 1 minute
export const revalidate = 60;

export default async function HomePage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { heroTitle: true, heroSubtitle: true, socialLinks: true },
  });

  if (!settings) {
    notFound();
  }

  const socialLinks = settings.socialLinks as Record<string, string> | null;

  return (
    <main className="min-h-screen flex justify-center items-center">
      <div className="container">
        <div className="flex flex-wrap gap-6 justify-evenly items-center -mt-16">
          <div className="max-w-2xl gap-2 flex flex-col">
            <h1 className="text-2xl font-bold">{settings.heroTitle}</h1>
            <p>{settings.heroSubtitle}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ButtonLink color="secondary" radius="full" href="/projects">
                View my work
              </ButtonLink>
              <ButtonLink color="primary" href="/contact">
                Contact Me
              </ButtonLink>
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
