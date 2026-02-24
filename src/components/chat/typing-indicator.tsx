"use client";

import { useQuery } from "convex/react";

import type { Doc, Id } from "@/convex/api";
import { api } from "@/convex/api";

export function TypingIndicator({
  conversationId,
  members,
}: {
  conversationId: Id<"conversations">;
  members: Doc<"users">[];
}) {
  const typing = useQuery(api.typing.listTyping, { conversationId }) ?? [];
  if (typing.length === 0) {
    return null;
  }

  const names = typing
    .map((record) => members.find((member) => member._id === record.userId)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="px-6 pb-2 text-xs text-muted-foreground">
      {names || "Someone"} {typing.length > 1 ? "are" : "is"} typing...
    </div>
  );
}
