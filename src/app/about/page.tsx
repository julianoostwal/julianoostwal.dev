import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import type { Metadata } from "next";
import { generateSiteMetadata } from "@/lib/seo";
import { quixly, showQuixly } from "@/lib/quixly";

// Backstop only - the settings API revalidates this page on save.
export const revalidate = 3600;

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
    select: { siteName: true, aboutContent: true, contactEmail: true },
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
          {showQuixly(settings.siteName) && (
            <section className="my-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2">{quixly.name}</h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
                Besides freelancing, I run my own company, {quixly.name}. {quixly.tagline} You work directly with
                me as the developer: clear quotes, transparent pricing and no middlemen.
              </p>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                {quixly.services.map((service) => (
                  <div key={service.title}>
                    <h3 className="font-semibold mb-1">{service.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-2">Own products</h3>
              <ul className="mb-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {quixly.products.map((product) => (
                  <li key={product.name}>
                    <span className="font-medium text-foreground">{product.name}</span> &ndash; {product.description}
                  </li>
                ))}
              </ul>
              <Button as={Link} href={quixly.url} isExternal color="primary" variant="flat">
                Visit quixly.dev
              </Button>
            </section>
          )}
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
