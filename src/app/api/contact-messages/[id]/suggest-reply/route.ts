import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { generateContactReplySuggestion } from "@/lib/ai/openrouter";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { reply, model } = await generateContactReplySuggestion({
      subject: message.subject || "(no subject)",
      message: message.message,
      fromName: message.name,
    });

    await prisma.contactMessage.update({
      where: { id },
      data: {
        aiSuggestedReply: reply,
        aiModel: model,
        aiSuggestedAt: new Date(),
      },
    });

    return Response.json({ reply, model });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "AI generation failed" },
      { status: 400 }
    );
  }
}

