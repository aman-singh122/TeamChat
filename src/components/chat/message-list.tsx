import { useMemo } from "react";
import { ArrowDown } from "lucide-react";

import type { Doc } from "@/convex/api";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageItem } from "@/components/chat/message-item";
import { MessagesPlaceholder } from "@/components/chat/messages-placeholder";
import { Button } from "@/components/ui/button";

type MessageListProps = {
  messages: Doc<"messages">[];
  members: Doc<"users">[];
  currentUserId?: string;
};

export function MessageList({
  messages,
  members,
  currentUserId,
}: MessageListProps) {
  const sorted = useMemo(
    () =>
      [...messages]
        .filter((message) => !message.deleted)
        .sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );

  const memberMap = useMemo(
    () => new Map(members.map((member) => [member._id, member.name])),
    [members]
  );

  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll([
    sorted.length,
  ]);

  if (sorted.length === 0) {
    return (
      <div className="flex min-h-0 flex-1">
        <MessagesPlaceholder />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background">
      <div
        ref={containerRef}
        className="flex h-full w-full min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5 md:px-8"
      >
        {sorted.map((message) => (
          <MessageItem
            key={message._id}
            text={message.text}
            createdAt={message.createdAt}
            senderName={
              message.senderId === currentUserId
                ? "You"
                : memberMap.get(message.senderId) ?? "Unknown"
            }
            isOwn={message.senderId === currentUserId}
          />
        ))}
      </div>

      {!isAtBottom ? (
        <div className="absolute bottom-4 right-5 md:right-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full border border-border/80 bg-card shadow-soft"
          >
            <ArrowDown className="mr-1 h-3.5 w-3.5" />
            New messages
          </Button>
        </div>
      ) : null}
    </div>
  );
}
