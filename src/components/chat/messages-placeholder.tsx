import { MessageSquareDashed } from "lucide-react";

export function MessagesPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MessageSquareDashed className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">No messages yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Send the first message to kick off the conversation.
        </p>
      </div>
    </div>
  );
}
