// Julian's own company. Shown on the site and referenced in structured data.
export const quixly = {
  name: "Quixly Development",
  url: "https://quixly.dev",
  portfolioUrl: "https://quixly.dev/en/portfolio",
  tagline: "Custom websites and web platforms, made in the Netherlands.",
  services: [
    {
      title: "Websites",
      description: "Business websites and one-pagers, designed per client, mobile-friendly and built to be found on Google.",
    },
    {
      title: "Platforms & portals",
      description: "Client portals, dashboards, integrations with existing systems and custom internal tools.",
    },
    {
      title: "Hosting & maintenance",
      description: "Hosting on a Dutch server with daily backups, plus updates and small changes handled for you.",
    },
  ],
  products: [
    { name: "Quixly Mail", description: "European-hosted email API for transactional mail, inbound mail and webhooks." },
    { name: "Quixly Pulse", description: "SEO crawler, privacy-friendly analytics, uptime monitoring and load testing." },
    { name: "Quixly Weather", description: "Weather app that combines eleven forecast models." },
  ],
} as const;

// The repo doubles as a template; only show Quixly on Julian's own site.
export function showQuixly(siteName: string | null | undefined) {
  return siteName === "Julian Oostwal";
}
