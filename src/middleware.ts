import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Check if this is a project page
  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slugOrId = projectMatch[1];
    
    // Check if this project has noIndex enabled
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
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
  }

  return response;
}

export const config = {
  matcher: ["/projects/:path*"],
};
