import { useMemo } from "react";
import { ArrowDown } from "lucide-react";

import type { Doc, Id } from "@/convex/api";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageItem } from "@/components/chat/message-item";
import { MessagesPlaceholder } from "@/components/chat/messages-placeholder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type FailedMessage = {
  clientId: string;
  text: string;
  createdAt: number;
};

type ForwardTarget = {
  id: Id<"conversations">;
  title: string;
};

type MessageListProps = {
  messages: Doc<"messages">[];
  members: Doc<"users">[];
  currentUserId?: string;
  isLoading?: boolean;
  failedMessages?: FailedMessage[];
  onRetryFailed?: (clientId: string) => void;
  onEditMessage?: (messageId: Id<"messages">, text: string) => Promise<void>;
  onForwardMessage?: (
    messageId: Id<"messages">,
    targetConversationId: Id<"conversations">
  ) => Promise<void>;
  forwardTargets?: ForwardTarget[];
};

export function MessageList({
  messages,
  members,
  currentUserId,
  isLoading = false,
  failedMessages = [],
  onRetryFailed,
  onEditMessage,
  onForwardMessage,
  forwardTargets = [],
}: MessageListProps) {
  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );

  const memberMap = useMemo(
    () => new Map(members.map((member) => [member._id, member.name])),
    [members]
  );

  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll([
    sorted[sorted.length - 1]?._id,
    sorted[sorted.length - 1]?.createdAt,
    failedMessages.length,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 py-5 md:px-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`message-skeleton-${index}`}
            className={index % 2 === 0 ? "self-start" : "self-end"}
          >
            <Skeleton className="h-16 w-56 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (sorted.length === 0 && failedMessages.length === 0) {
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
        className="flex h-full w-full min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-5 md:px-8"
      >
        {sorted.map((message) => (
          <MessageItem
            key={message._id}
            messageId={message._id}
            text={message.text}
            createdAt={message.createdAt}
            senderName={
              message.senderId === currentUserId
                ? "You"
                : memberMap.get(message.senderId) ?? "Unknown"
            }
            isOwn={message.senderId === currentUserId}
            deleted={message.deleted}
            onEditMessage={onEditMessage}
            onForwardMessage={onForwardMessage}
            forwardTargets={forwardTargets}
          />
        ))}
        {failedMessages.map((message) => (
          <MessageItem
            key={message.clientId}
            text={message.text}
            createdAt={message.createdAt}
            senderName="You"
            isOwn
            failed
            onRetryFailed={
              onRetryFailed ? () => onRetryFailed(message.clientId) : undefined
            }
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
