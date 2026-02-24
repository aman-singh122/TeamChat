import { formatMessageTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";

type MessageItemProps = {
  text: string;
  createdAt: number;
  senderName: string;
  isOwn: boolean;
};

export function MessageItem({
  text,
  createdAt,
  senderName,
  isOwn,
}: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1.5",
        isOwn ? "items-end" : "items-start"
      )}
    >
      <span className="px-1 text-xs font-medium text-muted-foreground">
        {senderName}
      </span>

      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm sm:max-w-[74%]",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/80 bg-card text-card-foreground"
        )}
      >
        {text}
      </div>

      <span className="px-1 text-[11px] text-muted-foreground/80">
        {formatMessageTimestamp(new Date(createdAt))}
      </span>
    </div>
  );
}
