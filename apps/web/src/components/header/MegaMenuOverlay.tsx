"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MegaCategory } from "./PublicHeader";

type Props = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  headerRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onRequestOpen: () => void;
  onRequestClose: () => void;
  offset?: number;
  mega: MegaCategory[];
  activeId: string;
  setActiveId: (id: string) => void;
};

export function MegaMenuOverlay({
  open,
  anchorRef,
  containerRef,
  headerRef,
  onClose,
  onRequestOpen,
  onRequestClose,
  offset = 10,
  mega,
  activeId,
  setActiveId,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [backdropTop, setBackdropTop] = useState(0);
  const rafId = useRef<number | null>(null);
  const active = useMemo(() => {
    if (!mega || mega.length === 0) return undefined;
    return mega.find((x) => x.id === activeId) ?? mega[0];
  }, [mega, activeId]);

  useEffect(() => setMounted(true), []);

  // (برای انیمیشن خروج)
  useEffect(() => {
    if (open) {
      setRender(true);
      return;
    }
    const t = window.setTimeout(() => setRender(false), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  const calc = () => {
    const anchorEl = anchorRef.current;
    if (!anchorEl) {
      setPos(null);
      return;
    }

    const a = anchorEl.getBoundingClientRect();
    const headerEl = headerRef?.current ?? null;
    const containerEl = containerRef?.current ?? null;
    const headerRect = headerEl?.getBoundingClientRect();
    const containerRect = containerEl?.getBoundingClientRect();
    const maxWidth = 1260;
    const safePadding = 12;
    const width = Math.round(
      containerRect?.width
        ? Math.min(maxWidth, containerRect.width)
        : Math.min(maxWidth, window.innerWidth - safePadding * 2)
    );
    let left = Math.round(a.right - width);
    const minLeft = safePadding;
    const maxLeft = window.innerWidth - width - safePadding;
    left = Math.max(minLeft, Math.min(maxLeft, left));
    const anchorTop = Math.round(a.bottom + offset);
    const minTop = headerRect ? Math.round(headerRect.bottom + 1) : 0;
    const top = Math.max(anchorTop, minTop);
    setPos({ top, left, width });
  };

  const calcBackdropTop = () => {
    const headerEl = headerRef?.current ?? null;
    const anchorEl = anchorRef.current ?? null;

    if (headerEl) {
      setBackdropTop(Math.round(headerEl.getBoundingClientRect().bottom));
      return;
    }
    if (anchorEl) {
      setBackdropTop(Math.round(anchorEl.getBoundingClientRect().bottom));
      return;
    }
    setBackdropTop(0);
  };

  const scheduleCalc = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      calcBackdropTop();
      calc();
    });
  };

  useEffect(() => {
    if (!open) return;

    scheduleCalc();

    const onScroll = () => scheduleCalc();
    const onResize = () => scheduleCalc();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const vv = window.visualViewport;
    vv?.addEventListener("scroll", onScroll, { passive: true } as any);
    vv?.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => scheduleCalc());
    if (headerRef?.current) ro.observe(headerRef.current);
    if (containerRef?.current) ro.observe(containerRef.current);
    if (anchorRef.current) ro.observe(anchorRef.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onScroll as any);
      vv?.removeEventListener("resize", onResize as any);
      ro.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !render) return null;
  if (!mega || mega.length === 0) return null;

  const panelReady = !!pos;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop فقط زیر header */}
      <button
        aria-label="بستن مگامنو"
        onClick={onClose}
        className={[
          "absolute left-0 right-0 bottom-0",
          "bg-black/55 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
          "pointer-events-auto",
        ].join(" ")}
        style={{ top: backdropTop }}
      />

      {/* Panel */}
      {panelReady ? (
        <div
          className={[
            "fixed pointer-events-auto",
            "transition-all duration-200",
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
          ].join(" ")}
          style={{
            top: pos!.top,
            left: pos!.left,
            width: pos!.width,
          }}
          onMouseEnter={onRequestOpen}
          onMouseLeave={onRequestClose}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white border border-gray-200 rounded shadow-2xl overflow-hidden">
            <div className="flex h-[460px]">
              {/* Right rail */}
              <aside className="w-[280px] border-l border-gray-100 bg-white">
                <div className="h-12 px-4 flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-700">دسته‌بندی کالاها</div>
                </div>

                <div className="h-[calc(460px-48px)] overflow-auto">
                  {mega.map((c) => {
                    const isActive = c.id === (active?.id ?? mega[0].id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onMouseEnter={() => setActiveId(c.id)}
                        onFocus={() => setActiveId(c.id)}
                        className={[
                          "w-full px-4 py-3 text-sm flex items-center justify-between text-right",
                          "hover:bg-gray-50",
                          isActive ? "bg-gray-50 font-bold text-rose-600" : "text-gray-800",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={[
                              "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
                              isActive ? "border-rose-200 bg-rose-50" : "border-gray-200 bg-white",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "w-2 h-2 rounded-full",
                                isActive ? "bg-rose-500" : "bg-gray-400",
                              ].join(" ")}
                            />
                          </span>

                          <span className="truncate">{c.title}</span>
                        </div>

                        <span
                          className={[
                            "h-6 w-[3px] rounded-full",
                            isActive ? "bg-rose-500" : "bg-transparent",
                          ].join(" ")}
                        />
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Content */}
              <main className="flex-1 overflow-auto">
                <div className="h-12 px-6 flex items-center justify-between border-b border-gray-100">
                  <Link
                    href={active?.href ?? "/shop"}
                    onClick={onClose}
                    className="text-sm font-bold text-sky-600 hover:text-sky-700"
                  >
                    همه محصولات {active?.title}
                  </Link>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {active?.groups?.map((g) => (
                      <section key={g.title} className="min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-[2px] h-4 bg-rose-500 rounded-full" />
                          <h3 className="text-sm font-extrabold text-gray-900 truncate">
                            {g.title}
                          </h3>
                        </div>

                        <ul className="space-y-2">
                          {g.items.map((it) => (
                            <li key={it.href}>
                              <Link
                                href={it.href}
                                onClick={onClose}
                                className="block text-sm text-gray-700 hover:text-gray-900"
                              >
                                {it.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    پیشنهاد ویژه: اینجا جای بنر/پروموشن.
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  );
}
