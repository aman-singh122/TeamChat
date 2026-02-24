import { useMemo } from "react";
import type { Doc } from "@/convex/api";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageItem } from "@/components/chat/message-item";
import { MessagesPlaceholder } from "@/components/chat/messages-placeholder";
import { ArrowDown } from "lucide-react";

type MessageListProps = {
  messages: Doc<"messages">[];
  members: Doc<"users">[];
  currentUserId?: string;
};

export function MessageList({ messages, members, currentUserId }: MessageListProps) {
  const sorted = useMemo(
    () =>
      [...messages]
        .filter((m) => !m.deleted)
        .sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );

  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll([messages.length]);

  const memberMap = useMemo(
    () => new Map(members.map((m) => [m._id, m.name])),
    [members]
  );

  if (sorted.length === 0) return <MessagesPlaceholder />;

  return (
    <>
      <style>{`
        .ml-wrap {
          position: relative; flex: 1; overflow: hidden;
          font-family: 'Geist', -apple-system, sans-serif;
        }
        .ml-scroll {
          height: 100%; overflow-y: auto;
          padding: 20px 24px 12px;
          display: flex; flex-direction: column; gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }
        .ml-scroll::-webkit-scrollbar { width: 3px; }
        .ml-scroll::-webkit-scrollbar-track { background: transparent; }
        .ml-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }

        .ml-scroll-btn {
          position: absolute; bottom: 16px; right: 20px;
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px 7px 10px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.65);
          cursor: pointer; transition: all 0.15s;
          font-family: inherit; letter-spacing: -0.01em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          animation: ml-up 0.2s ease; outline: none;
        }
        .ml-scroll-btn:hover {
          background: #222;
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.85);
        }
        @keyframes ml-up {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="ml-wrap">
        <div ref={containerRef} className="ml-scroll">
          {sorted.map((message) => (
            <MessageItem
              key={message._id}
              text={message.text}
              createdAt={message.createdAt}
              senderName={
                message.senderId === currentUserId
                  ? "You"
                  : memberMap.get(message.senderId) ?? "Unknown"
              }
              isOwn={message.senderId === currentUserId}
            />
          ))}
        </div>

        {!isAtBottom && (
          <button className="ml-scroll-btn" onClick={scrollToBottom}>
            <ArrowDown size={13} strokeWidth={2.5} />
            New messages
          </button>
        )}
      </div>
    </>
  );
}