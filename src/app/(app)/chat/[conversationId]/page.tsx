

import type { Id } from "@/convex/api";
import { ConversationView } from "@/components/chat/conversation-view";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <ConversationView
        conversationId={conversationId as Id<"conversations">}
      />
    </div>
  );
}
