import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const passwordHash = await hash("Admin123!", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "info@julianoostwal.dev" },
    update: {},
    create: {
      email: "info@julianoostwal.dev",
      username: "Julian Oostwal",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Default site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Julian Oostwal",
      siteDescription: "Full-stack developer portfolio showcasing modern web development projects built with Next.js.",
      heroTitle: "Hi, I'm Julian Oostwal",
      heroSubtitle: "I'm a full-stack developer with a passion for building seamless, user-focused web experiences. From responsive frontends with Next.js to robust backends with .NET — I bring ideas to life with clean, efficient code.",
      aboutContent: `I'm Julian Oostwal, a {{age:2007-06-29}}-year-old full-stack developer committed to creating efficient, high-quality digital solutions that prioritize user experience. With a solid foundation in modern web technologies, I specialize in building applications that seamlessly integrate design and functionality, ensuring optimal performance across devices.

My approach to development is grounded in best practices and a drive for continuous improvement. I prioritize clean, maintainable code and adhere to industry standards, making sure each project aligns with modern development trends. By balancing technical rigor with attention to detail, I aim to deliver applications that are both robust and easy to use.

On the frontend, I craft responsive, interactive user interfaces. On the backend, I build scalable APIs and services with reliable data management. This full-stack expertise allows me to take projects from concept to deployment, handling every layer of the application.

Outside of work, I'm always expanding my skill set. Currently, I'm diving into full-stack Kotlin development — exploring new technologies keeps me sharp and passionate about what I do.

Currently advancing my technical expertise at Bit Academy, I also collaborate on freelance projects, applying a detail-oriented and results-driven approach. My academic and freelance experiences allow me to stay current with evolving web standards and client expectations, enabling me to build effective, scalable solutions that cater to a wide range of digital needs.

If you're seeking a full-stack developer dedicated to bringing reliable, effective solutions to life, feel free to reach out. I'm open to new projects and eager to contribute my skills to innovative digital experiences. Let's connect to discuss how I can support your next project.`,
      contactEmail: "info@julianoostwal.dev",
      socialLinks: {
        github: "https://github.com/julianoostwal",
        linkedin: "",
        twitter: "",
      },
      seoKeywords: [
        "Julian Oostwal",
        "Full-Stack Developer",
        "Portfolio",
        "Web Development",
        "Next.js",
        "React",
        "TypeScript",
        "Laravel",
        ".NET",
        "Tailwind CSS",
      ],
      technologySlugs: [
        // Frontend
        "typescript",
        "javascript",
        "react",
        "nextdotjs",
        "vuedotjs",
        "nuxtdotjs",
        "html5",
        "css3",
        "tailwindcss",
        "framer",
        "heroui",
        "shadcnui",
        // Backend
        "nodedotjs",
        "express",
        "laravel",
        "php",
        "dotnet",
        "csharp",
        "kotlin",
        // Mobile
        "reactnative",
        // Databases
        "postgresql",
        "mongodb",
        "redis",
        "supabase",
        "prisma",
        // DevOps & Tools
        "docker",
        "nginx",
        "git",
        "github",
        "gitlab",
        "coolify",
        // IDEs
        "visualstudiocode",
        "phpstorm",
        "intellijidea",
      ],
    },
  });

  console.log("✅ Site settings created");

  // Create portfolio project
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: "portfolio-website" },
      update: {},
      create: {
        title: "Portfolio Website",
        slug: "portfolio-website",
        description: "My personal portfolio website built with Next.js, featuring an admin panel, custom auth, and s3 storage.",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "HeroUI"],
        featured: true,
        published: true,
        sortOrder: 1,
        authorId: admin.id,
      },
    }),
  ]);

  console.log("✅ Sample projects created:", projects.length);

  console.log("\n🎉 Seeding completed!\n");
  console.log("Admin credentials:");
  console.log("  Email: info@julianoostwal.dev");
  console.log("  Password: Admin123!");
  console.log("\n⚠️  Change these credentials after first login!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
