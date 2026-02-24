"use client";

import * as React from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";

import { api } from "@/convex/api";
import { ConversationList } from "@/components/sidebar/conversation-list";
import { NewConversationDialog } from "@/components/sidebar/new-conversation-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SidebarConversation as SidebarConversationType } from "@/types/chat";

export function Sidebar() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrent,
    isLoaded && isSignedIn ? {} : "skip"
  );
  const conversations = useQuery(
    api.conversations.listSidebar,
    isLoaded && isSignedIn ? {} : "skip"
  );
  const [search, setSearch] = React.useState("");

  const normalizedConversations: SidebarConversationType[] = (conversations ?? []).map(
    (item) => ({
      ...item,
      members: item.members.filter(
        (member): member is NonNullable<(typeof item.members)[number]> =>
          member !== null
      ),
    })
  );

  const filtered = normalizedConversations.filter((item) => {
    const title = item.conversation.isGroup
      ? item.conversation.name ?? "Group"
      : item.members.find((m) => m._id !== currentUser?._id)?.name ??
        "Direct message";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="hidden h-screen w-80 shrink-0 flex-col border-r border-border/70 bg-card/50 backdrop-blur md:flex">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            TimeCommunication
          </p>
          <p className="text-base font-semibold text-foreground">Conversations</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="space-y-3 border-b border-border/70 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            className="h-10 bg-background pl-9"
          />
        </div>
        <NewConversationDialog />
      </div>

      <div className="min-h-0 flex-1 px-3 py-3">
        {conversations ? (
          filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-6 text-center text-sm text-muted-foreground">
              {search ? "No search results." : "No conversations yet."}
            </div>
          ) : (
            <ConversationList
              conversations={filtered}
              currentUserId={currentUser?._id}
            />
          )
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={`sidebar-skeleton-${idx}`}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-3"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border/70 px-4 py-3">
        <UserButton />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {currentUser?.name ?? "Account"}
          </p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>
    </aside>
  );
}
