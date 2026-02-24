"use client";

import * as React from "react";
import { MessageSquareDashed } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import type { Id } from "@/convex/api";
import { api } from "@/convex/api";
import { getConversationTitle } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { SummaryButton } from "@/components/ai/summary-button";

export function ConversationView({
  conversationId,
}: {
  conversationId?: Id<"conversations">;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const shouldRun = isLoaded && isSignedIn;

  const data = useQuery(
    api.conversations.getById,
    conversationId && shouldRun ? { conversationId } : "skip"
  );
  const currentUser = useQuery(api.users.getCurrent, shouldRun ? {} : "skip");
  const messages = useQuery(
    api.messages.listByConversation,
    conversationId && shouldRun ? { conversationId } : "skip"
  );
  const unreadCount =
    useQuery(
      api.messages.unreadCount,
      conversationId && shouldRun ? { conversationId } : "skip"
    ) ?? 0;
  const unreadMessages =
    useQuery(
      api.messages.unreadMessages,
      conversationId && shouldRun ? { conversationId, limit: 200 } : "skip"
    ) ?? [];
  const markRead = useMutation(api.messages.markConversationRead);
  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const forwardMessage = useMutation(api.messages.forwardMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const sidebarConversations = useQuery(
    api.conversations.listSidebar,
    shouldRun ? {} : "skip"
  );
  const [failedMessages, setFailedMessages] = React.useState<
    { clientId: string; text: string; createdAt: number }[]
  >([]);

  React.useEffect(() => {
    if (!conversationId || !data?.conversation) return;
    void markRead({ conversationId });
  }, [conversationId, data?.conversation, messages?.length, markRead]);

  const handleSend = React.useCallback(
    async (text: string) => {
      if (!conversationId) {
        return;
      }
      try {
        await sendMessage({ conversationId, text });
      } catch {
        const clientId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;
        setFailedMessages((prev) => [
          ...prev,
          { clientId, text, createdAt: Date.now() },
        ]);
        toast.error("Message failed to send.");
      }
    },
    [conversationId, sendMessage]
  );

  const handleRetryFailed = React.useCallback(
    async (clientId: string) => {
      const failed = failedMessages.find((item) => item.clientId === clientId);
      if (!failed || !conversationId) {
        return;
      }
      try {
        await sendMessage({ conversationId, text: failed.text });
        setFailedMessages((prev) => prev.filter((item) => item.clientId !== clientId));
      } catch {
        toast.error("Retry failed. Check your connection and try again.");
      }
    },
    [conversationId, failedMessages, sendMessage]
  );

  const handleTyping = React.useCallback(async () => {
    if (!conversationId) {
      return;
    }
    await setTyping({ conversationId });
  }, [conversationId, setTyping]);

  const handleEditMessage = React.useCallback(
    async (messageId: Id<"messages">, text: string) => {
      await editMessage({ messageId, text });
    },
    [editMessage]
  );

  const handleForwardMessage = React.useCallback(
    async (
      messageId: Id<"messages">,
      targetConversationId: Id<"conversations">
    ) => {
      await forwardMessage({ messageId, targetConversationId });
    },
    [forwardMessage]
  );

  if (!conversationId) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-background px-6">
        <div className="max-w-sm space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <MessageSquareDashed className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No conversation selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Pick one from the sidebar or start a new conversation.
          </p>
        </div>
      </div>
    );
  }

  if (!shouldRun || data === undefined) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-background">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/70" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/30 [animation-delay:240ms]" />
        </div>
      </div>
    );
  }

  if (!data?.conversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Conversation not found.</p>
      </div>
    );
  }

  const { conversation } = data;
  const members = data.members.filter(
    (member): member is NonNullable<(typeof data.members)[number]> => member !== null
  );
  const forwardTargets = (sidebarConversations ?? [])
    .filter((item) => item.conversation._id !== conversationId)
    .map((item) => ({
      id: item.conversation._id,
      title: getConversationTitle(
        item.conversation,
        item.members.filter(
          (member): member is NonNullable<(typeof item.members)[number]> =>
            member !== null
        ),
        currentUser?._id
      ),
    }));

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <ChatHeader
        conversation={conversation}
        members={members}
        currentUser={currentUser}
        summaryButton={
          <SummaryButton
            unreadCount={unreadCount}
            unreadMessages={unreadMessages}
            recentMessages={messages ?? []}
            members={members}
          />
        }
      />
      <MessageList
        messages={messages ?? []}
        members={members}
        currentUserId={currentUser?._id}
        isLoading={messages === undefined}
        failedMessages={failedMessages}
        onRetryFailed={handleRetryFailed}
        onEditMessage={handleEditMessage}
        onForwardMessage={handleForwardMessage}
        forwardTargets={forwardTargets}
      />
      <TypingIndicator conversationId={conversationId} members={members} />
      <MessageComposer onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
