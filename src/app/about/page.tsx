import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import type { Metadata } from "next";
import { generateSiteMetadata } from "@/lib/seo";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata({
    title: "About",
    pathname: "/about",
  });
}

function parseContent(content: string): string {
  return content.replace(/\{\{age:(\d{4}-\d{2}-\d{2})\}\}/g, (_, birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  });
}

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { aboutContent: true, contactEmail: true },
  });

  if (!settings?.aboutContent) {
    notFound();
  }

  const paragraphs = parseContent(settings.aboutContent).split("\n\n");

  return (
    <main className="min-h-screen">
      <div className="container py-12 px-6 mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6 text-center">About Me</h1>
        <div className="max-w-4xl mx-auto">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg mb-6 leading-relaxed">
              {paragraph}
            </p>
          ))}
          <div className="text-center">
            <Button as={Link} href="/contact" size="lg" variant="ghost" color="primary">
              Contact me
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
