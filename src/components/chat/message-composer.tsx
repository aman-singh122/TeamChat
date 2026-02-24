"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import type { Id } from "@/convex/api";
import { api } from "@/convex/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MessageComposerProps = {
  conversationId: Id<"conversations">;
};

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [value, setValue] = React.useState("");
  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const typingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;
    try {
      await sendMessage({ conversationId, text });
      setValue("");
    } catch (error) {
      toast.error("Message failed to send.");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    void setTyping({ conversationId });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 2000);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-border/60 bg-background p-4">
      <Input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <Button onClick={handleSend} disabled={!value.trim()}>
        <Send className="h-4 w-4" />
        Send
      </Button>
    </div>
  );
}
