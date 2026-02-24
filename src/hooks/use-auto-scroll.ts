"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoScroll(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const hasScrolledInitially = useRef(false);
  const shouldStickRef = useRef(true);

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
    shouldStickRef.current = true;
    setIsAtBottom(true);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateState();
    shouldStickRef.current = true;
    el.addEventListener("scroll", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
    };
  }, [updateState]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const shouldForceInitial = !hasScrolledInitially.current;
    const shouldAutoScroll = shouldForceInitial || shouldStickRef.current;
    if (!shouldAutoScroll) {
      return;
    }

    requestAnimationFrame(() => {
      const node = containerRef.current;
      if (!node) {
        return;
      }
      node.scrollTo({
        top: node.scrollHeight,
        behavior: shouldForceInitial ? "auto" : "smooth",
      });
      hasScrolledInitially.current = true;
      setIsAtBottom(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    shouldStickRef.current = isAtBottom;
  }, [isAtBottom]);

  return { containerRef, isAtBottom, scrollToBottom };
}
