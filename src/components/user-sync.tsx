"use client";

import { useSyncUser } from "@/hooks/use-sync-user";

export function UserSync() {
  useSyncUser();
  return null;
}
