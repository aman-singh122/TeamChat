import { ConversationItem } from "@/components/sidebar/conversation-item";
import type { SidebarConversation } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ConversationList({
  conversations,
  currentUserId,
}: {
  conversations: SidebarConversation[];
  currentUserId?: string;
}) {
  if (!conversations.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-6 text-center text-sm text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 overscroll-contain">
      <div className="space-y-2">
        {conversations.map((item) => (
          <ConversationItem
            key={item.conversation._id}
            data={item}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
