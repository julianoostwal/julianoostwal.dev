import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const settings = await prisma.siteSettings.update({
      where: { id: "default" },
      data: {
        ...(body.siteName !== undefined && { siteName: body.siteName }),
        ...(body.siteDescription !== undefined && { siteDescription: body.siteDescription }),
        ...(body.heroTitle !== undefined && { heroTitle: body.heroTitle }),
        ...(body.heroSubtitle !== undefined && { heroSubtitle: body.heroSubtitle }),
        ...(body.aboutContent !== undefined && { aboutContent: body.aboutContent }),
        ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
        ...(body.socialLinks !== undefined && { socialLinks: body.socialLinks }),
        ...(body.seoKeywords !== undefined && { seoKeywords: body.seoKeywords }),
        ...(body.technologySlugs !== undefined && { technologySlugs: body.technologySlugs }),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
