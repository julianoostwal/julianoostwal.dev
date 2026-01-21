import { prisma } from "@/lib/db/prisma";
import ContactMessagesTable from "@/components/admin/ContactMessagesTable";

export const revalidate = 0;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const filterRaw = typeof sp.filter === "string" ? sp.filter : "unread";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const filter =
    filterRaw === "all" || filterRaw === "spam" || filterRaw === "unread"
      ? filterRaw
      : "unread";

  const where: Record<string, unknown> = {};
  if (filter === "unread") where.isRead = false;
  if (filter === "spam") where.isSpam = true;
  if (filter !== "spam") where.isSpam = false;

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [messages, totalCount, unreadCount, spamCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        isRead: true,
        isSpam: true,
        spamScore: true,
        geoCountry: true,
        geoCity: true,
        createdAt: true,
      },
    }),
    prisma.contactMessage.count({ where: { isSpam: false } }),
    prisma.contactMessage.count({ where: { isRead: false, isSpam: false } }),
    prisma.contactMessage.count({ where: { isSpam: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your contact form inbox (unread, spam, and search)
        </p>
      </div>

      <ContactMessagesTable
        messages={messages}
        counts={{ total: totalCount, unread: unreadCount, spam: spamCount }}
        filter={filter}
        q={q}
      />
    </div>
  );
}

