import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { siteName: true, siteDescription: true },
  });

  const siteName = settings?.siteName || "Portfolio";
  const description = settings?.siteDescription || "";

  return {
    name: `${siteName} | Portfolio`,
    short_name: siteName,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      }
    ],
  };
}
