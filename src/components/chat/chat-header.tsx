"use client";

import type { ReactNode } from "react";
import { Circle } from "lucide-react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";

import type { Doc } from "@/convex/api";
import { api } from "@/convex/api";
import { getConversationTitle, getConversationImage } from "@/lib/conversation";
import { formatMessageTimestamp } from "@/lib/time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CallControls } from "@/components/calls/call-controls";

type ChatHeaderProps = {
  conversation: Doc<"conversations">;
  members: Doc<"users">[];
  currentUser?: Doc<"users"> | null;
  summaryButton?: ReactNode;
};

export function ChatHeader({
  conversation,
  members,
  currentUser,
  summaryButton,
}: ChatHeaderProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const activeCall = useQuery(
    api.calls.getActiveForConversation,
    isLoaded && isSignedIn ? { conversationId: conversation._id } : "skip"
  );
  const callActive = !!activeCall;
  const title = getConversationTitle(
    conversation,
    members,
    currentUser?._id
  );
  const image = getConversationImage(
    conversation,
    members,
    currentUser?._id
  );
  const fallback = title
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const otherMember = members.find((member) => member._id !== currentUser?._id);
  const statusLabel = conversation.isGroup
    ? `${members.length} members`
    : otherMember?.isOnline
      ? "Online"
      : otherMember?.lastSeen
        ? `Last seen ${formatMessageTimestamp(new Date(otherMember.lastSeen))}`
        : "Offline";

  return (
    <div className="flex items-center justify-between border-b border-border/60 bg-background px-6 py-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={image} alt={title} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <p className="text-base font-semibold">{title}</p>
            {summaryButton ? <div className="ml-1">{summaryButton}</div> : null}
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {!conversation.isGroup ? (
              <Circle
                className={`h-2 w-2 ${otherMember?.isOnline ? "text-success" : "text-muted-foreground"}`}
                fill="currentColor"
              />
            ) : null}
            {statusLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {callActive ? (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            In call
          </span>
        ) : null}
        <CallControls conversationId={conversation._id} />
      </div>
    </div>
  );
}
