"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import { api } from "@/convex/api";
import { ConversationList } from "@/components/sidebar/conversation-list";
import { NewConversationDialog } from "@/components/sidebar/new-conversation-dialog";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 30, height: 30 }} />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "rgba(255,255,255,0.45)",
        transition: "all 0.15s", outline: "none", flexShrink: 0,
      }}
    >
      {theme === "dark" ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
    </button>
  );
}

export function Sidebar() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.getCurrent, isLoaded && isSignedIn ? {} : "skip");
  const conversations = useQuery(api.conversations.listSidebar, isLoaded && isSignedIn ? {} : "skip");
  const [search, setSearch] = React.useState("");

  const filtered = (conversations ?? []).filter((item) => {
    const title = item.conversation.isGroup
      ? item.conversation.name ?? "Group"
      : item.members.find((m) => m._id !== currentUser?._id)?.name ?? "Direct message";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <style>{`
        .sb {
          width: 272px; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: #0d0d0d;
          border-right: 1px solid rgba(255,255,255,0.06);
          height: 100vh; overflow: hidden;
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        @media (max-width: 768px) { .sb { display: none; } }

        /* Header */
        .sb-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 14px 11px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
        }
        .sb-logo { display: flex; align-items: center; gap: 8px; }
        .sb-mark {
          width: 26px; height: 26px; border-radius: 7px; background: #fff;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sb-name {
          font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.85); letter-spacing: -0.022em;
        }

        /* Search + new conv section */
        .sb-mid {
          padding: 11px 12px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          display: flex; flex-direction: column; gap: 7px;
          flex-shrink: 0;
        }
        .sb-search-wrap { position: relative; }
        .sb-search-ico {
          position: absolute; left: 9px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2); pointer-events: none; display: flex;
        }
        .sb-input {
          width: 100%; height: 32px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 0 10px 0 29px;
          font-size: 12.5px; color: rgba(255,255,255,0.72);
          outline: none; transition: border-color 0.15s, background 0.15s;
          font-family: inherit; letter-spacing: -0.01em;
        }
        .sb-input::placeholder { color: rgba(255,255,255,0.22); }
        .sb-input:focus {
          border-color: rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.055);
        }

        /* Section label */
        .sb-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 10px 14px 5px; flex-shrink: 0;
        }

        /* List */
        .sb-list {
          flex: 1; overflow-y: auto; padding: 2px 8px 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.05) transparent;
        }
        .sb-list::-webkit-scrollbar { width: 3px; }
        .sb-list::-webkit-scrollbar-track { background: transparent; }
        .sb-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }

        /* Empty */
        .sb-empty {
          margin: 6px 2px; padding: 20px 14px; text-align: center;
          border: 1px dashed rgba(255,255,255,0.07); border-radius: 10px;
          font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.65; font-weight: 300;
        }

        /* Skeleton */
        .sb-skel { display: flex; align-items: center; gap: 10px; padding: 9px 6px; }
        .sk-av {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.05); flex-shrink: 0;
          animation: sk 1.6s ease-in-out infinite;
        }
        .sk-ln { border-radius: 4px; background: rgba(255,255,255,0.05); animation: sk 1.6s ease-in-out infinite; }
        @keyframes sk { 0%,100% { opacity:0.4; } 50% { opacity:0.85; } }

        /* Footer */
        .sb-footer {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,0.055);
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0; background: #0d0d0d;
        }
        .sb-user-text { flex: 1; min-width: 0; }
        .sb-uname {
          font-size: 13.5px; font-weight: 500;
          color: #fff;
          letter-spacing: -0.015em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.3;
        }
        .sb-ustatus {
          font-size: 11px; color: rgba(255,255,255,0.35);
          display: flex; align-items: center; gap: 4px; margin-top: 2px;
        }
        .on-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #4ade80; flex-shrink: 0;
          animation: bl 2.5s ease-in-out infinite;
        }
        @keyframes bl { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>

      <aside className="sb">

        {/* ── HEADER ── */}
        <div className="sb-header">
          <div className="sb-logo">
            <div className="sb-mark">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="#0a0a0a"/>
                <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.4"/>
                <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.4"/>
                <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.15"/>
              </svg>
            </div>
            <span className="sb-name">TimeComm</span>
          </div>
          <ThemeToggle />
        </div>

        {/* ── SEARCH + NEW ── */}
        <div className="sb-mid">
          <div className="sb-search-wrap">
            <span className="sb-search-ico"><Search size={12} strokeWidth={2} /></span>
            <input
              className="sb-input"
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <NewConversationDialog />
        </div>

        {/* ── LABEL ── */}
        <div className="sb-label">{search ? "Results" : "Conversations"}</div>

        {/* ── LIST ── */}
        <div className="sb-list">
          {conversations ? (
            filtered.length === 0 ? (
              <div className="sb-empty">
                {search
                  ? <>No results for "{search}"</>
                  : <>No conversations yet.<br />Start one above.</>}
              </div>
            ) : (
              <ConversationList conversations={filtered} currentUserId={currentUser?._id} />
            )
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sb-skel">
                <div className="sk-av" style={{ animationDelay: `${i * 0.1}s` }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="sk-ln" style={{ height: 11, width: "60%", animationDelay: `${i * 0.1}s` }} />
                  <div className="sk-ln" style={{ height: 9, width: "42%", animationDelay: `${i * 0.1 + 0.05}s` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="sb-footer">
          <UserButton appearance={{ elements: { avatarBox: { width: 30, height: 30 } } }} />
          <div className="sb-user-text">
            <div className="sb-uname">{currentUser?.name ?? "Account"}</div>
            <div className="sb-ustatus">
              <span className="on-dot" />
              Online
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}