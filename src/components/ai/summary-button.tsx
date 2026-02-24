"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import type { Doc } from "@/convex/api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type SummaryButtonProps = {
  unreadCount: number;
  unreadMessages: Doc<"messages">[];
  recentMessages: Doc<"messages">[];
  members: Doc<"users">[];
};

export function SummaryButton({
  unreadCount,
  unreadMessages,
  recentMessages,
  members,
}: SummaryButtonProps) {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSummarize = async () => {
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
        setError("No messages available to summarize.");
        return;
      }

      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        throw new Error(errorBody.error ?? "Request failed");
      }

      const data = (await response.json()) as { summary: string };
      setSummary(data.summary);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to summarize right now."
      );
    } finally {
      setLoading(false);
    }
  };

  if (recentMessages.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-full border-border/80 bg-card/80 px-3 text-xs shadow-sm"
        >
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          AI Summary
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-3">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Conversation summary</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread messages` : "Latest messages"}
            </p>
          </div>
          {summary ? (
            <ul className="max-h-56 space-y-1 overflow-y-auto pl-5 text-sm text-muted-foreground">
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
            <Button onClick={handleSummarize} disabled={loading} className="w-full">
              {loading ? "Summarizing..." : "Generate summary"}
            </Button>
          )}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
