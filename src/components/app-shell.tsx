"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/sidebar/sidebar";
import { Button } from "@/components/ui/button";
import { UserSync } from "@/components/user-sync";
import { CallManager } from "@/components/calls/call-manager";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <UserSync />
      <CallManager />
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-4 md:hidden">
          <div className="text-sm font-semibold">TimeCommunication</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="icon" variant="ghost" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <main className="flex min-h-0 flex-1 overflow-hidden bg-background">{children}</main>
      </div>
    </div>
  );
}
