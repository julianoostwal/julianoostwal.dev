import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as
    | Partial<{ isRead: boolean; isSpam: boolean }>
    | null;

  if (!body || (typeof body.isRead !== "boolean" && typeof body.isSpam !== "boolean")) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.isRead === "boolean") {
    data.isRead = body.isRead;
    data.readAt = body.isRead ? new Date() : null;
  }
  if (typeof body.isSpam === "boolean") {
    data.isSpam = body.isSpam;
    if (body.isSpam) data.isRead = true;
  }

  await prisma.contactMessage.update({
    where: { id },
    data,
  });

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return Response.json({ ok: true });
}

