"use client";

import { useEffect, useRef, useState } from "react";

function readPxVar(name: string, fallback = 0) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(v.replace("px", ""));
  return Number.isFinite(n) ? n : fallback;
}

function getSidebarTopPx(topVar: string) {
  const fromVar = readPxVar(topVar, NaN);
  if (Number.isFinite(fromVar) && fromVar > 0) return fromVar;

  // fallback: header + gap + tabs + gap
  const headerH = readPxVar("--public-header-h", 0);
  const tabsH = readPxVar("--pdp-tabs-h", 48);
  return headerH + 8 + tabsH + 12;
}

export default function PdpStickySidebar({
  endId,
  children,
  topVar = "--pdp-sidebar-top",
  className = "",
}: {
  endId: string;
  children: React.ReactNode;
  topVar?: string;
  className?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const endElRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    endElRef.current = document.getElementById(endId);

    const update = () => {
      const endEl = endElRef.current;
      if (!endEl) return;
      const stickyTop = getSidebarTopPx(topVar);
      const endTop = endEl.getBoundingClientRect().top;
      setHidden(endTop <= stickyTop);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [endId, topVar]);

  const topCss =
    topVar === "--pdp-sidebar-top"
      ? "var(--pdp-sidebar-top, calc(var(--public-header-h, 0px) + 8px + var(--pdp-tabs-h, 48px) + 12px))"
      : `var(${topVar})`;

  return (
    <div
      className={[
        "sticky transition-[top,opacity,transform] duration-200 ease-in-out",
        hidden ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100 translate-y-0",
        className,
      ].join(" ")}
      style={{ top: topCss }}
    >
      {children}
    </div>
  );
}