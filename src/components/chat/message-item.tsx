import { cn } from "@/lib/utils";
import { formatMessageTimestamp } from "@/lib/time";

type MessageItemProps = {
  text: string;
  createdAt: number;
  senderName: string;
  isOwn: boolean;
};

export function MessageItem({ text, createdAt, senderName, isOwn }: MessageItemProps) {
  return (
    <>
      <style>{`
        .msg-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: 'Geist', -apple-system, sans-serif;
        }
        .msg-row.own { align-items: flex-end; }
        .msg-row.other { align-items: flex-start; }

        .msg-sender {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.28);
          letter-spacing: -0.01em;
          padding: 0 4px;
        }

        .msg-bubble {
          max-width: 68%;
          padding: 9px 13px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.55;
          letter-spacing: -0.01em;
          word-break: break-word;
        }

        .msg-bubble.own {
          background: #fff;
          color: #0a0a0a;
          border-bottom-right-radius: 4px;
          font-weight: 400;
        }

        .msg-bubble.other {
          background: #1a1a1a;
          color: rgba(255,255,255,0.82);
          border: 1px solid rgba(255,255,255,0.07);
          border-bottom-left-radius: 4px;
          font-weight: 300;
        }

        .msg-time {
          font-size: 10.5px;
          color: rgba(255,255,255,0.2);
          padding: 0 4px;
          letter-spacing: 0;
        }
      `}</style>

      <div className={`msg-row ${isOwn ? "own" : "other"}`}>
        <span className="msg-sender">{senderName}</span>
        <div className={`msg-bubble ${isOwn ? "own" : "other"}`}>
          {text}
        </div>
        <span className="msg-time">
          {formatMessageTimestamp(new Date(createdAt))}
        </span>
      </div>
    </>
  );
}