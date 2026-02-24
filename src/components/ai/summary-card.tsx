"use client";

import * as React from "react";

import type { Doc } from "@/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SummaryCardProps = {
  unreadCount: number;
  unreadMessages: Doc<"messages">[];
  recentMessages: Doc<"messages">[];
  members: Doc<"users">[];
};

export function SummaryCard({
  unreadCount,
  unreadMessages,
  recentMessages,
  members,
}: SummaryCardProps) {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSummarize = async () => {
    if (summary) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const senderLookup = new Map(members.map((member) => [member._id, member.name]));
      const sourceMessages =
        unreadMessages.length > 0 ? unreadMessages : recentMessages.slice(-30);

      const payload = [...sourceMessages]
        .filter((message) => !message.deleted && message.text.trim().length > 0)
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((message) => ({
          text: message.text,
          sender: senderLookup.get(message.senderId) ?? "Unknown",
          createdAt: message.createdAt,
        }));

      if (payload.length === 0) {
        setError("No unread messages to summarize.");
        return;
      }

      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as { summary: string };
      setSummary(data.summary);
    } catch {
      setError("We couldn't summarize this conversation right now.");
    } finally {
      setLoading(false);
    }
  };

  if (recentMessages.length < 1) {
    return null;
  }

  return (
    <Card className="mx-6 my-4 p-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold">AI chat summary</p>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread messages`
              : "Summarize the latest messages"}
          </p>
        </div>
        {summary ? (
          <ul className="space-y-2 pl-5 text-sm text-muted-foreground">
            {summary
              .split("\n")
              .filter(Boolean)
              .map((line) => (
                <li key={line} className="list-disc">
                  {line.replace(/^(?:[-*])\s*/, "")}
                </li>
              ))}
          </ul>
        ) : (
          <Button onClick={handleSummarize} disabled={loading}>
            {loading
              ? "Summarizing..."
              : unreadCount > 0
                ? "Summarize missed messages"
                : "Summarize recent chat"}
          </Button>
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </Card>
  );
}
