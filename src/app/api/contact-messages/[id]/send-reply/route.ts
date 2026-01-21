import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

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

  if (!process.env.MAILERSEND_API_KEY) {
    return Response.json({ error: "MAILERSEND_API_KEY is not configured" }, { status: 500 });
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { contactEmail: true, siteName: true },
  });

  const fromEmail = settings?.contactEmail;
  const fromName = settings?.siteName;

  if (!fromEmail?.trim()) {
    return Response.json(
      { error: "No sender email configured" },
      { status: 500 }
    );
  }

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

  const sentFrom = new Sender(fromEmail, fromName);
  const recipients = [new Recipient(message.email, message.name)];

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>${escapeHtml(replyBody).replace(/\n/g, "<br>")}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#6b7280;font-size:12px">
        Replying to your message sent via julianoostwal.dev contact form.
      </p>
    </div>
  `;

  try {
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(htmlBody);

    const response = await mailerSend.email.send(emailParams);
    if (response.statusCode !== 202) {
      throw new Error(`Failed to send email: ${response.statusCode}`);
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
