"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Eye, EyeOff, Flag, FlagOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  isSpam: boolean;
  spamScore: number;
  geoCountry: string | null;
  geoCity: string | null;
  createdAt: Date;
}

export default function ContactMessagesTable({
  messages,
  counts,
  filter,
  q,
}: {
  messages: ContactMessageRow[];
  counts: { total: number; unread: number; spam: number };
  filter: "unread" | "spam" | "all";
  q: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState(q);

  const tabs = useMemo(
    () => [
      { key: "unread", label: `Unread (${counts.unread})` },
      { key: "all", label: `All (${counts.total})` },
      { key: "spam", label: `Spam (${counts.spam})` },
    ],
    [counts]
  );

  function buildHref(nextFilter: string) {
    const params = new URLSearchParams();
    if (nextFilter && nextFilter !== "unread") params.set("filter", nextFilter);
    if (search.trim()) params.set("q", search.trim());
    const qs = params.toString();
    return qs ? `/admin/messages?${qs}` : "/admin/messages";
  }

  async function updateMessage(
    id: string,
    patch: Partial<{ isRead: boolean; isSpam: boolean }>
  ) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      toast.error("Failed to update message");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Message deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setLoadingId(null);
    }
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardBody className="p-10 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <Button
                  key={t.key}
                  as={Link}
                  href={buildHref(t.key)}
                  size="sm"
                  variant={filter === t.key ? "solid" : "flat"}
                  color={filter === t.key ? "primary" : "default"}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <div className="max-w-md">
              <Input
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(buildHref(filter));
                }}
              />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No messages found.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <div className="p-4 border-b space-y-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                as={Link}
                href={buildHref(t.key)}
                size="sm"
                variant={filter === t.key ? "solid" : "flat"}
                color={filter === t.key ? "primary" : "default"}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[240px] max-w-lg">
              <Input
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(buildHref(filter));
                }}
              />
            </div>
            <Button
              size="sm"
              variant="flat"
              onClick={() => router.push(buildHref(filter))}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                  From
                </th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                  Subject
                </th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                  Location
                </th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">
                  Received
                </th>
                <th className="text-right p-4 font-medium text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {messages.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {m.name}
                      </span>
                      {!m.isRead && (
                        <Chip size="sm" color="primary" variant="flat">
                          New
                        </Chip>
                      )}
                      {m.isSpam && (
                        <Chip size="sm" color="danger" variant="flat">
                          Spam
                        </Chip>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{m.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {m.subject || "(no subject)"}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2 max-w-[520px]">
                      {m.message}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {m.geoCity || m.geoCountry
                      ? `${m.geoCity ? `${m.geoCity}, ` : ""}${m.geoCountry ?? ""}`
                      : "—"}
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        as={Link}
                        href={`/admin/messages/${m.id}`}
                        size="sm"
                        variant="light"
                        isIconOnly
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={() => updateMessage(m.id, { isRead: !m.isRead })}
                        isLoading={loadingId === m.id}
                      >
                        {m.isRead ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={() => updateMessage(m.id, { isSpam: !m.isSpam })}
                        isLoading={loadingId === m.id}
                      >
                        {m.isSpam ? (
                          <FlagOff className="w-4 h-4" />
                        ) : (
                          <Flag className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        onClick={() => deleteMessage(m.id)}
                        isLoading={loadingId === m.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {m.isSpam && (
                      <div className="mt-2 text-xs text-gray-500">
                        spam score: {m.spamScore}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

