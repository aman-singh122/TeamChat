import type { Doc } from "@/convex/api";

export type SidebarConversation = {
  conversation: Doc<"conversations">;
  members: Array<Doc<"users">>;
  lastMessage?: Doc<"messages"> | null;
  unread: number;
};
