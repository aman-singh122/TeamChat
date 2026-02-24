"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Plus, Search } from "lucide-react";

import type { Id } from "@/convex/api";
import { api } from "@/convex/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NewConversationDialog() {
  const router = useRouter();
  const users = useQuery(api.users.list) ?? [];
  const createDirect = useMutation(api.conversations.createDirectConversation);
  const createGroup = useMutation(api.conversations.createGroupConversation);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [groupName, setGroupName] = React.useState("");
  const [selected, setSelected] = React.useState<Id<"users">[]>([]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setGroupName("");
      setSelected([]);
    }
  }, [open]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDirect = async (userId: Id<"users">) => {
    const id = await createDirect({ otherUserId: userId });
    setOpen(false);
    router.push(`/chat/${id}`);
  };

  const handleGroup = async () => {
    if (!groupName.trim() || selected.length === 0) return;
    const id = await createGroup({ name: groupName.trim(), memberIds: selected });
    setOpen(false);
    router.push(`/chat/${id}`);
  };

  const toggleUser = (userId: Id<"users">) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 w-full justify-center rounded-xl">
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>
            Start a direct message or create a group.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct">
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1">
              Direct
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64 pr-1">
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    No users found.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-left transition hover:bg-muted/60"
                      onClick={() => handleDirect(user._id)}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-4 space-y-3">
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <ScrollArea className="h-56 pr-1">
              <div className="space-y-2">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border/70 bg-background px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={selected.includes(user._id)}
                      onCheckedChange={() => toggleUser(user._id)}
                    />
                  </label>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={handleGroup}
              disabled={!groupName.trim() || selected.length === 0}
              className="w-full rounded-xl"
            >
              Create group
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
