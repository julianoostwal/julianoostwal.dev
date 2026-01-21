"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input, Textarea } from "@heroui/input";
import { Flag, FlagOff, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  isSpam: boolean;
  spamScore: number;
  spamReasons: string[];
  ipAnonymized: string | null;
  userAgent: string | null;
  referer: string | null;
  acceptLanguage: string | null;
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  aiSuggestedReply: string | null;
  aiModel: string | null;
  aiSuggestedAt: Date | null;
  replySubject: string | null;
  replyBody: string | null;
  repliedAt: Date | null;
  createdAt: Date;
}

export default function ContactMessageDetail({ message }: { message: ContactMessage }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState(
    message.replySubject ?? `Re: ${message.subject ?? "your message"}`
  );
  const [replyBody, setReplyBody] = useState(message.replyBody ?? "");
  const [suggested, setSuggested] = useState(message.aiSuggestedReply ?? "");

  const location = useMemo(() => {
    const parts = [message.geoCity, message.geoRegion, message.geoCountry].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  }, [message.geoCity, message.geoCountry, message.geoRegion]);

  async function update(patch: Partial<{ isSpam: boolean; isRead: boolean }>) {
    setLoading("update");
    try {
      const res = await fetch(`/api/contact-messages/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      toast.error("Failed to update message");
    } finally {
      setLoading(null);
    }
  }

  async function del() {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/contact-messages/${message.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Message deleted");
      router.push("/admin/messages");
      router.refresh();
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setLoading(null);
    }
  }

  async function generateSuggestedReply() {
    setLoading("ai");
    try {
      const res = await fetch(`/api/contact-messages/${message.id}/suggest-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "AI generation failed");
      setSuggested(json.reply || "");
      if (!replyBody.trim()) setReplyBody(json.reply || "");
      toast.success("Suggested reply generated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI generation failed");
    } finally {
      setLoading(null);
    }
  }

  async function sendReply() {
    if (!replySubject.trim() || !replyBody.trim()) {
      toast.error("Subject and reply are required");
      return;
    }
    setLoading("send");
    try {
      const res = await fetch(`/api/contact-messages/${message.id}/send-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: replySubject, body: replyBody }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Send failed");
      toast.success("Reply sent");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {message.isSpam ? (
              <Chip color="danger" variant="flat">
                Spam
              </Chip>
            ) : (
              <Chip color="success" variant="flat">
                Inbox
              </Chip>
            )}
            <Chip variant="flat">{message.isRead ? "Read" : "Unread"}</Chip>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="flat"
                startContent={message.isSpam ? <FlagOff className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                onClick={() => update({ isSpam: !message.isSpam })}
                isLoading={loading === "update"}
              >
                {message.isSpam ? "Not spam" : "Mark spam"}
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<Trash2 className="w-4 h-4" />}
                onClick={del}
                isLoading={loading === "delete"}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {message.subject || "(no subject)"}
            </div>
            <div className="text-sm text-gray-500">
              From: <span className="font-medium">{message.name}</span> &lt;{message.email}&gt;
            </div>
            <div className="text-sm text-gray-500">
              Received: {new Date(message.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="whitespace-pre-wrap rounded-lg border border-border p-4 bg-background/50">
            {message.message}
          </div>

          {message.isSpam && (
            <div className="text-sm text-gray-500">
              Spam score: {message.spamScore}
              {message.spamReasons?.length ? ` (${message.spamReasons.join(", ")})` : ""}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-2 text-sm">
            <div className="font-semibold">Metadata (privacy-friendly)</div>
            <div>
              Location: <span className="text-gray-500">{location}</span>
            </div>
            <div>
              IP (anonymized):{" "}
              <span className="text-gray-500">{message.ipAnonymized || "—"}</span>
            </div>
            <div className="truncate">
              User-Agent:{" "}
              <span className="text-gray-500">{message.userAgent || "—"}</span>
            </div>
            <div className="truncate">
              Referer: <span className="text-gray-500">{message.referer || "—"}</span>
            </div>
            <div className="truncate">
              Language:{" "}
              <span className="text-gray-500">{message.acceptLanguage || "—"}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">AI suggested reply</div>
              <Button
                size="sm"
                variant="flat"
                startContent={<Sparkles className="w-4 h-4" />}
                onClick={generateSuggestedReply}
                isLoading={loading === "ai"}
              >
                Generate
              </Button>
            </div>
            {message.aiModel && (
              <div className="text-xs text-gray-500">
                Model: {message.aiModel}
              </div>
            )}
            <Textarea
              label="Suggested reply"
              value={suggested}
              onChange={(e) => setSuggested(e.target.value)}
              minRows={4}
              description="Using AI sends the message content to OpenRouter."
            />
            <Button
              size="sm"
              variant="flat"
              onClick={() => {
                setReplyBody(suggested);
                toast.success("Copied into reply");
              }}
              isDisabled={!suggested.trim()}
            >
              Use suggested reply
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <div className="font-semibold">Reply</div>
            <Input
              label="Subject"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
            />
            <Textarea
              label="Message"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              minRows={6}
            />
            <Button
              color="primary"
              onClick={sendReply}
              isLoading={loading === "send"}
            >
              Send reply
            </Button>
            {message.repliedAt && (
              <div className="text-xs text-gray-500">
                Last sent: {new Date(message.repliedAt).toLocaleString()}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
