"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import type { Id } from "@/convex/api";
import { api } from "@/convex/api";

import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { SummaryCard } from "@/components/ai/summary-card";

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
  const messages =
    useQuery(
      api.messages.listByConversation,
      conversationId && shouldRun ? { conversationId, limit: 100 } : "skip"
    ) ?? [];
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

  React.useEffect(() => {
    if (!conversationId || !data?.conversation) return;
    void markRead({ conversationId });
  }, [conversationId, data?.conversation, messages.length, markRead]);

  /* ── Empty state ── */
  if (!conversationId) {
    return (
      <>
        <style>{`
          .cv-empty {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 12px; padding: 40px;
            background: #0a0a0a;
            font-family: 'Geist', -apple-system, sans-serif;
          }
          .cv-empty-icon {
            width: 44px; height: 44px; border-radius: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.07);
            display: flex; align-items: center; justify-content: center;
          }
          .cv-empty h3 {
            font-size: 15px; font-weight: 500;
            color: rgba(255,255,255,0.6); letter-spacing: -0.02em;
            margin: 0;
          }
          .cv-empty p {
            font-size: 13px; color: rgba(255,255,255,0.25);
            margin: 0; font-weight: 300;
          }
        `}</style>
        <div className="cv-empty">
          <div className="cv-empty-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>No conversation selected</h3>
          <p>Pick one from the sidebar or start a new one.</p>
        </div>
      </>
    );
  }

  /* ── Loading ── */
  if (!shouldRun || data === undefined) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              animation: "ldot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes ldot {
            0%,80%,100% { transform: scale(0.6); opacity:0.3; }
            40% { transform: scale(1); opacity:0.8; }
          }
        `}</style>
      </div>
    );
  }

  /* ── Not found ── */
  if (!data?.conversation) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", fontSize: 13, color: "rgba(255,255,255,0.28)", fontFamily: "'Geist', sans-serif" }}>
        Conversation not found.
      </div>
    );
  }

  const { conversation, members } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0a0a0a" }}>
      <ChatHeader conversation={conversation} members={members} currentUser={currentUser} />
      <SummaryCard unreadCount={unreadCount} unreadMessages={unreadMessages} members={members} />
      <MessageList messages={messages} members={members} currentUserId={currentUser?._id} />
      <TypingIndicator conversationId={conversationId} members={members} />
      <MessageComposer conversationId={conversationId} />
    </div>
  );
}