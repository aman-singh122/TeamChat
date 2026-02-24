import type { Doc } from "@/convex/api";

export function getConversationTitle(
  conversation: Doc<"conversations">,
  members: Array<Doc<"users">>,
  currentUserId?: string
) {
  if (conversation.isGroup) {
    return conversation.name ?? "Group chat";
  }

  const other = members.find((member) => member._id !== currentUserId);
  return other?.name ?? "Direct message";
}

export function getConversationImage(
  conversation: Doc<"conversations">,
  members: Array<Doc<"users">>,
  currentUserId?: string
) {
  if (conversation.isGroup) {
    return undefined;
  }
  const other = members.find((member) => member._id !== currentUserId);
  return other?.image;
}
