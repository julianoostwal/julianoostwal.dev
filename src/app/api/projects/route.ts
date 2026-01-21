import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

// GET /api/projects - Get all projects (public: only published, admin: all)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = !!session;

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    const where = isAdmin
      ? {}
      : { published: true };

    if (featured === "true") {
      Object.assign(where, { featured: true });
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        liveUrl: true,
        githubUrl: true,
        technologies: true,
        featured: true,
        published: isAdmin,
        noIndex: isAdmin,
        sortOrder: isAdmin,
        createdAt: true,
        updatedAt: true,
      },
    });

    const projectsWithSlug = projects.map((p) => ({
      ...p,
      slug: p.slug || p.id,
    }));

    return NextResponse.json(projectsWithSlug);
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      content,
      imageUrl,
      liveUrl,
      githubUrl,
      technologies,
      featured,
      published,
      noIndex,
      sortOrder,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug if provided
    if (slug) {
      const existingProject = await prisma.project.findUnique({
        where: { slug },
      });

      if (existingProject) {
        return NextResponse.json(
          { error: "A project with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: slug || null,
        description,
        content,
        imageUrl,
        liveUrl,
        githubUrl,
        technologies: technologies || [],
        featured: featured || false,
        published: published || false,
        noIndex: noIndex || false,
        sortOrder: sortOrder || 0,
        authorId: session.userId,
      },
    });

    return NextResponse.json({
      ...project,
      slug: project.slug || project.id,
    }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
