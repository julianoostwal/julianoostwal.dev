import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getMailClient, getMailFrom } from "@/lib/email/client";

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MAIL_API_KEY || !process.env.MAIL_BASE_URL || !process.env.MAIL_FROM) {
    return Response.json(
      { error: "MAIL_API_KEY / MAIL_BASE_URL / MAIL_FROM is not configured" },
      { status: 500 }
    );
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { contactEmail: true, siteName: true },
  });

  const fromName = settings?.siteName?.trim() || "Portfolio";
  const replyTo = settings?.contactEmail?.trim() || undefined;

  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return Response.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { subject?: string; body?: string }
    | null;
  const subject = body?.subject?.trim() || "";
  const replyBody = body?.body?.trim() || "";

  if (!subject || !replyBody) {
    return Response.json({ error: "Subject and body are required" }, { status: 400 });
  }

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>${escapeHtml(replyBody).replace(/\n/g, "<br>")}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#6b7280;font-size:12px">
        Replying to your message sent via ${escapeHtml(fromName)} contact form.
      </p>
    </div>
  `;

  try {
    const { error: sendError } = await getMailClient().emails.send({
      from: getMailFrom(fromName),
      to: [`${message.name.replace(/[<>"]/g, "")} <${message.email}>`],
      replyTo,
      subject,
      html: htmlBody,
    });
    if (sendError) {
      throw new Error(`Failed to send email: ${sendError.message}`);
    }

    await prisma.contactMessage.update({
      where: { id },
      data: {
        replySubject: subject,
        replyBody: replyBody,
        repliedAt: new Date(),
        isRead: true,
      },
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to send reply" },
      { status: 500 }
    );
  }
}
