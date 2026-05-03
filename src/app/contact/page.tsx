import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";
import { generateSiteMetadata } from "@/lib/seo";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata({
    title: "Contact",
    pathname: "/contact",
  });
}

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { contactEmail: true },
  });

  if (!settings?.contactEmail) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-4.5rem)] min-h-[calc(100dvh-4.5rem)] flex justify-center items-center p-4 py-8">
      <ContactForm contactEmail={settings.contactEmail} />
    </main>
  );
}
