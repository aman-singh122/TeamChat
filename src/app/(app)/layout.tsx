import type { ReactNode } from "react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SignedIn>
        <AppShell>{children}</AppShell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
