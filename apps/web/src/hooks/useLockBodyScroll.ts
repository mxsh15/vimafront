"use client";

import { useEffect } from "react";

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const body = document.body;

    // scrollbar compensation
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.setProperty("--scrollbar-compensation", `${scrollbarWidth}px`);

    body.classList.add("no-scroll");

    return () => {
      body.classList.remove("no-scroll");
      body.style.removeProperty("--scrollbar-compensation");
    };
  }, [locked]);
}
