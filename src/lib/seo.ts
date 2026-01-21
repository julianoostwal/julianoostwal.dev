import { Metadata, Viewport } from "next";
import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const getSiteSettings = cache(async () => {
  return prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: {
      siteName: true,
      siteDescription: true,
      jobTitle: true,
      seoKeywords: true,
      socialLinks: true,
      knowsAbout: true,
    },
  });
});

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  pathname?: string;
}

export async function generateSiteMetadata(options: GenerateMetadataOptions = {}): Promise<Metadata> {
  const settings = await getSiteSettings();

  const {
    title,
    description = settings?.siteDescription ?? "",
    keywords = settings?.seoKeywords ?? [],
    image = "/og-image.png",
    noIndex = false,
    pathname = "",
  } = options;

  const siteName = settings?.siteName ?? "Portfolio";
  const jobTitle = settings?.jobTitle?.trim() || "Full-Stack Developer";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | ${jobTitle} Portfolio`;

  const url = `${baseUrl}${pathname}`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: siteName, url: baseUrl }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: fullTitle,
      description,
      siteName: `${siteName} Portfolio`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD structured data
export async function generatePersonSchema() {
  const settings = await getSiteSettings();

  const socialLinks = settings?.socialLinks as Record<string, string> | null;
  const sameAs = Object.values(socialLinks ?? {}).filter(Boolean);

  const knowsAbout = (settings?.knowsAbout ?? [])
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 30);

  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings?.siteName ?? "Portfolio",
    url: baseUrl,
    image: `${baseUrl}/profile.jpg`,
    jobTitle: settings?.jobTitle?.trim() || "Full-Stack Developer",
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
    sameAs,
  };

  if (knowsAbout.length > 0) {
    person.knowsAbout = knowsAbout;
  }

  return person;
}

export async function generateWebsiteSchema() {
  const settings = await getSiteSettings();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${settings?.siteName ?? "Portfolio"} Portfolio`,
    url: baseUrl,
    description: settings?.siteDescription ?? "",
    author: {
      "@type": "Person",
      name: settings?.siteName ?? "Portfolio",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/projects?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProjectSchema(project: {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  createdAt: Date;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    url: `${baseUrl}/projects/${project.slug}`,
    image: project.imageUrl,
    applicationCategory: "WebApplication",
    operatingSystem: "Web Browser",
    author: {
      "@type": "Person",
      name: project.authorName ?? "Portfolio",
    },
    datePublished: project.createdAt.toISOString(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
