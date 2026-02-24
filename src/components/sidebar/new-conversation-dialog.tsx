"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Search } from "lucide-react";

import type { Id } from "@/convex/api";
import { api } from "@/convex/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setGroupName("");
      setSelected([]);
    }
  }, [open]);

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
    <>
      <style>{`
        .ncd-trigger {
          width: 100%;
          height: 32px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Geist', -apple-system, sans-serif;
          letter-spacing: -0.01em;
          outline: none;
        }
        .ncd-trigger:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
        }

        /* Dialog inner styling */
        .ncd-search {
          width: 100%;
          height: 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 0 10px 0 32px;
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .ncd-search::placeholder { color: rgba(255,255,255,0.25); }
        .ncd-search:focus { border-color: rgba(255,255,255,0.18); }

        .ncd-user-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ncd-user-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
        }

        .ncd-group-label {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.15s;
        }
        .ncd-group-label:hover { background: rgba(255,255,255,0.055); }

        .ncd-input {
          width: 100%;
          height: 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 0 12px;
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .ncd-input::placeholder { color: rgba(255,255,255,0.25); }
        .ncd-input:focus { border-color: rgba(255,255,255,0.18); }

        .ncd-create-btn {
          width: 100%;
          height: 36px;
          background: #fff;
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
          letter-spacing: -0.02em;
        }
        .ncd-create-btn:hover { background: #efefef; }
        .ncd-create-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .ncd-empty {
          padding: 24px;
          text-align: center;
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.28);
        }
      `}</style>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="ncd-trigger">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="1" x2="6" y2="11"/>
              <line x1="1" y1="6" x2="11" y2="6"/>
            </svg>
            New conversation
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>
              Start a direct message or create a group chat.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="direct">
            <TabsList className="w-full">
              <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
              <TabsTrigger value="group"  className="flex-1">Group</TabsTrigger>
            </TabsList>

            {/* DIRECT */}
            <TabsContent value="direct" className="mt-3 space-y-3">
              <div style={{ position: "relative" }}>
                <Search size={13} strokeWidth={2} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
                <input
                  className="ncd-search"
                  placeholder="Search users"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <ScrollArea className="h-60 pr-1">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {filteredUsers.length === 0 ? (
                    <div className="ncd-empty">No users found.</div>
                  ) : filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      className="ncd-user-btn"
                      onClick={() => handleDirect(user._id)}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback style={{ fontSize: 11, fontWeight: 700 }}>
                          {user.name.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "-0.01em" }}>{user.name}</div>
                        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* GROUP */}
            <TabsContent value="group" className="mt-3 space-y-3">
              <input
                className="ncd-input"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <ScrollArea className="h-52 pr-1">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {users.map((user) => (
                    <label key={user._id} className="ncd-group-label">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback style={{ fontSize: 11, fontWeight: 700 }}>
                            {user.name.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "-0.01em" }}>{user.name}</div>
                          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{user.email}</div>
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
              <button
                className="ncd-create-btn"
                onClick={handleGroup}
                disabled={!groupName.trim() || selected.length === 0}
              >
                Create group
              </button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}