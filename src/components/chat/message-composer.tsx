"use client";

import * as React from "react";
import { Send, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_SETS = {
  quick: [
    "\u{1F44D}",
    "\u{2764}\u{FE0F}",
    "\u{1F602}",
    "\u{1F60A}",
    "\u{1F389}",
    "\u{1F525}",
    "\u{1F64F}",
    "\u{1F44F}",
  ],
  faces: [
    "\u{1F600}",
    "\u{1F603}",
    "\u{1F604}",
    "\u{1F609}",
    "\u{1F60D}",
    "\u{1F618}",
    "\u{1F61C}",
    "\u{1F61E}",
    "\u{1F622}",
    "\u{1F62E}",
  ],
  symbols: [
    "\u{2705}",
    "\u{274C}",
    "\u{26A0}\u{FE0F}",
    "\u{2728}",
    "\u{1F4A1}",
    "\u{1F680}",
    "\u{1F4AF}",
    "\u{1F4CC}",
    "\u{1F4C5}",
    "\u{23F3}",
  ],
} as const;

const RECENT_STORAGE_KEY = "tc_recent_emojis";

type MessageComposerProps = {
  onSend: (text: string) => Promise<void>;
  onTyping: () => Promise<void>;
};

export function MessageComposer({ onSend, onTyping }: MessageComposerProps) {
  const [value, setValue] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [recent, setRecent] = React.useState<string[]>([]);
  const typingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setRecent(parsed.slice(0, 8));
        }
      }
    } catch {
      // Ignore local storage failures.
    }
  }, []);

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;

    setSending(true);
    try {
      await onSend(text);
      setValue("");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    void onTyping();

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

  const persistRecent = (next: string[]) => {
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore local storage failures.
    }
  };

  const handleEmojiInsert = (emoji: string) => {
    setValue((prev) => `${prev}${emoji}`);
    const nextRecent = [emoji, ...recent.filter((item) => item !== emoji)].slice(0, 8);
    persistRecent(nextRecent);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-t border-border/70 bg-card/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex w-full items-center gap-3">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-border/80 bg-background"
              aria-label="Open emoji picker"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3">
            <div className="space-y-3">
              {recent.length > 0 ? (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Recent</p>
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => persistRecent([])}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {recent.map((emoji) => (
                      <Button
                        key={`recent-${emoji}`}
                        type="button"
                        variant="ghost"
                        className="h-8 rounded-md px-0 text-lg"
                        onClick={() => handleEmojiInsert(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Quick</p>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_SETS.quick.map((emoji) => (
                    <Button
                      key={`quick-${emoji}`}
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-md px-0 text-lg"
                      onClick={() => handleEmojiInsert(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Faces</p>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_SETS.faces.map((emoji) => (
                    <Button
                      key={`face-${emoji}`}
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-md px-0 text-lg"
                      onClick={() => handleEmojiInsert(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Symbols</p>
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_SETS.symbols.map((emoji) => (
                    <Button
                      key={`symbol-${emoji}`}
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-md px-0 text-lg"
                      onClick={() => handleEmojiInsert(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="h-12 rounded-2xl border-border/80 bg-background text-[15px]"
        />

        <Button
          onClick={handleSend}
          disabled={!value.trim() || sending}
          className="h-12 rounded-2xl px-6"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}

