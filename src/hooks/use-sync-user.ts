"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";

import { api } from "@/convex/api";

export function useSyncUser() {
  const upsert = useMutation(api.users.upsertFromClerk);
  const setPresence = useMutation(api.users.setPresence);
  const { isLoaded, isSignedIn } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }
    if (ranRef.current) {
      return;
    }
    ranRef.current = true;

    void upsert();
    void setPresence({ isOnline: true });

    const handleVisibility = () => {
      const isOnline = document.visibilityState === "visible";
      void setPresence({ isOnline });
    };

    const handleUnload = () => {
      void setPresence({ isOnline: false });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [setPresence, upsert]);
}
