/**
 * Local Seed Template
 *
 * Copy this file to `seed.local.ts` to seed your local database with custom data.
 * The file `seed.local.ts` is gitignored and won't be committed to the repository.
 *
 * Usage:
 *   1. Copy: `cp prisma/seed.local.template.ts prisma/seed.local.ts`
 *   2. Customize the data in the `seed` function
 *   3. Run: `pnpm db:seed`
 *
 * The seed function receives the Prisma client as an argument - do NOT create your own.
 */
import type { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

export default async function seed(prisma: PrismaClient) {
  console.log("🌱 Seeding database with local data...");

  // ─────────────────────────────────────────────────────────────────────────────
  // Admin User
  // ─────────────────────────────────────────────────────────────────────────────
  const passwordHash = await hash("YourSecurePassword123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "your-email@example.com" },
    update: {},
    create: {
      email: "your-email@example.com",
      username: "Your Name",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // ─────────────────────────────────────────────────────────────────────────────
  // Site Settings
  // ─────────────────────────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Your Name",
      siteDescription: "Your portfolio description for SEO.",
      jobTitle: "Full-Stack Developer",
      knowsAbout: [
        // Human-readable technology names for Schema.org
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
      ],
      heroTitle: "Hi, I'm Your Name",
      heroSubtitle: "A brief introduction about yourself and what you do.",
      aboutContent: `Your detailed about page content goes here.

You can use multiple paragraphs and Markdown formatting.

Use {{age:YYYY-MM-DD}} to display a dynamic age based on birth date.`,
      contactEmail: "your-email@example.com",
      socialLinks: {
        github: "https://github.com/your-username",
        linkedin: "https://www.linkedin.com/in/your-username",
        twitter: "",
      },
      seoKeywords: ["Portfolio", "Developer", "Your Name"],
      technologySlugs: [
        // Simple Icons slugs for the icon cloud
        // Find slugs at: https://simpleicons.org/
        "typescript",
        "react",
        "nextdotjs",
        "nodedotjs",
        "postgresql",
      ],
    },
  });

  console.log("✅ Site settings created");

  // ─────────────────────────────────────────────────────────────────────────────
  // Projects
  // ─────────────────────────────────────────────────────────────────────────────
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: "example-project" },
      update: {},
      create: {
        title: "Example Project",
        slug: "example-project",
        description: "A brief description of your project.",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        featured: true,
        published: true,
        sortOrder: 1,
        authorId: admin.id,
      },
    }),
    // Add more projects as needed...
  ]);

  console.log("✅ Projects created:", projects.length);

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n🎉 Local seeding completed!\n");
  console.log("Admin credentials:");
  console.log("  Email: your-email@example.com");
  console.log("  Password: YourSecurePassword123!");
  console.log("\n⚠️  Change these credentials after first login!");
}
