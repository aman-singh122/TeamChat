import * as React from "react";
import { useMutation } from "convex/react";
import { Copy, Ellipsis, Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Id } from "@/convex/api";
import { api } from "@/convex/api";
import { formatMessageTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ForwardTarget = {
  id: Id<"conversations">;
  title: string;
};

type MessageItemProps = {
  messageId?: Id<"messages">;
  text: string;
  createdAt: number;
  senderName: string;
  isOwn: boolean;
  deleted?: boolean;
  failed?: boolean;
  onRetryFailed?: () => void;
  onEditMessage?: (messageId: Id<"messages">, text: string) => Promise<void>;
  onForwardMessage?: (
    messageId: Id<"messages">,
    targetConversationId: Id<"conversations">
  ) => Promise<void>;
  forwardTargets?: ForwardTarget[];
};

export function MessageItem({
  messageId,
  text,
  createdAt,
  senderName,
  isOwn,
  deleted = false,
  failed = false,
  onRetryFailed,
  onEditMessage,
  onForwardMessage,
  forwardTargets = [],
}: MessageItemProps) {
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(text);

  React.useEffect(() => {
    if (!editing) {
      setDraft(text);
    }
  }, [editing, text]);

  const canMutate = !deleted && !failed && !!messageId;

  const handleDelete = async () => {
    if (!messageId) {
      return;
    }

    try {
      await deleteMessage({ messageId });
      toast.success("Message deleted");
    } catch {
      toast.error("Unable to delete message.");
    }
  };

  const handleEditSave = async () => {
    if (!messageId || !onEditMessage) {
      return;
    }

    const nextText = draft.trim();
    if (!nextText) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      await onEditMessage(messageId, nextText);
      setEditing(false);
      toast.success("Message updated");
    } catch {
      toast.error("Unable to edit message.");
    }
  };

  const handleCopy = async () => {
    if (!text.trim() || deleted || failed) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleForward = async (targetConversationId: Id<"conversations">) => {
    if (!messageId || !onForwardMessage) {
      return;
    }

    try {
      await onForwardMessage(messageId, targetConversationId);
      toast.success("Message forwarded");
    } catch {
      toast.error("Unable to forward message.");
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1.5",
        isOwn ? "items-end" : "items-start"
      )}
    >
      <span className="px-1 text-xs font-medium text-muted-foreground">{senderName}</span>

      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm sm:max-w-[74%]",
          deleted
            ? "border border-border/80 bg-muted/70 text-muted-foreground"
            : isOwn
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border/80 bg-card text-card-foreground",
          failed && "border-destructive/60 bg-destructive/10 text-foreground"
        )}
      >
        {editing ? (
          <div className="space-y-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="h-9 bg-background text-foreground"
            />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void handleEditSave()}>
                Save
              </Button>
            </div>
          </div>
        ) : deleted ? (
          <em className="text-sm">This message was deleted</em>
        ) : (
          text
        )}
      </div>

      {failed && onRetryFailed ? (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] text-destructive">Failed to send</span>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={onRetryFailed}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1 px-1">
          <span className="text-[11px] text-muted-foreground/80">
            {formatMessageTimestamp(new Date(createdAt))}
          </span>
          {!failed && messageId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  aria-label="Message actions"
                >
                  <Ellipsis className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                <DropdownMenuItem disabled={deleted || failed} onClick={() => void handleCopy()}>
                  <Copy className="h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                {isOwn ? (
                  <DropdownMenuItem
                    disabled={!canMutate || !onEditMessage}
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={!canMutate || !onForwardMessage || forwardTargets.length === 0}>
                    <SendHorizontal className="h-4 w-4" />
                    Forward
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {forwardTargets.map((target) => (
                      <DropdownMenuItem
                        key={target.id}
                        onClick={() => void handleForward(target.id)}
                      >
                        {target.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {isOwn ? (
                  <DropdownMenuItem disabled={!canMutate} onClick={() => void handleDelete()}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      )}

    </div>
  );
}
