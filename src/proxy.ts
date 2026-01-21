import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for login page and API routes - these should always be accessible
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if this is a project page and add noindex header if needed
  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slugOrId = projectMatch[1];
    
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      select: { noIndex: true },
    });
    
    if (project?.noIndex) {
      const response = NextResponse.next();
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }
  }

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin")) {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const payload = await verifyAccessToken(accessToken);
      if (!payload) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/projects/:path*"],
};
