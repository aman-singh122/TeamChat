import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Doc } from "@/convex/api";
import type { SidebarConversation } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatMessageTimestamp } from "@/lib/time";
import { getConversationTitle, getConversationImage } from "@/lib/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function ConversationItem({
  data,
  currentUserId,
}: {
  data: SidebarConversation;
  currentUserId?: string;
}) {
  const pathname = usePathname();
  const href = `/chat/${data.conversation._id}`;
  const isActive = pathname === href;
  const title = getConversationTitle(
    data.conversation,
    data.members,
    currentUserId
  );
  const image = getConversationImage(
    data.conversation,
    data.members,
    currentUserId
  );
  const fallback = title
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:bg-muted/60",
        isActive && "border-border/80 bg-muted/70"
      )}
    >
      <Avatar>
        <AvatarImage src={image} alt={title} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{title}</p>
          {data.lastMessage?.createdAt ? (
            <span className="text-xs text-muted-foreground">
              {formatMessageTimestamp(new Date(data.lastMessage.createdAt))}
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {data.lastMessage?.text ?? "No messages yet"}
        </p>
      </div>
      {data.unread > 0 ? (
        <Badge variant="secondary">{data.unread}</Badge>
      ) : null}
    </Link>
  );
}
