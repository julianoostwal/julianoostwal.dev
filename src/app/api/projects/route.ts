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
        sortOrder: isAdmin,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(projects);
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
      sortOrder,
    } = body;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        content,
        imageUrl,
        liveUrl,
        githubUrl,
        technologies: technologies || [],
        featured: featured || false,
        published: published || false,
        sortOrder: sortOrder || 0,
        authorId: session.userId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
