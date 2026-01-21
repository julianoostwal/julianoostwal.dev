import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import ContactMessageDetail from "@/components/admin/ContactMessageDetail";

export const revalidate = 0;

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!message) notFound();

  if (!message.isRead) {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Message
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View, classify (spam), and reply
        </p>
      </div>

      <ContactMessageDetail message={message} />
    </div>
  );
}

