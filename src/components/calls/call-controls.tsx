"use client";

import { Phone, Video } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/api";
import { api } from "@/convex/api";

type CallControlsProps = {
  conversationId: Id<"conversations">;
};

export function CallControls({ conversationId }: CallControlsProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const shouldRun = isLoaded && isSignedIn;
  const createCall = useMutation(api.calls.createCall);
  const active = useQuery(
    api.calls.getActiveForConversation,
    shouldRun ? { conversationId } : "skip"
  );
  const disabled = !!active;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="secondary"
        disabled={disabled}
        onClick={async () => {
          try {
            await createCall({ conversationId, type: "audio" });
          } catch (error) {
            toast.error("Unable to start call.");
          }
        }}
      >
        <Phone className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        disabled={disabled}
        onClick={async () => {
          try {
            await createCall({ conversationId, type: "video" });
          } catch (error) {
            toast.error("Unable to start call.");
          }
        }}
      >
        <Video className="h-4 w-4" />
      </Button>
    </div>
  );
}
