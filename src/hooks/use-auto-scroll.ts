"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoScroll(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const updateState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
    };
  }, [updateState]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, isAtBottom, scrollToBottom };
}
