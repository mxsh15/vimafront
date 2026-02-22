"use client";

import { useMemo, useRef, useState } from "react";
import type { PriceHistoryPointDto } from "@/modules/product/price-history";

function toFaNumber(n: number) {
    return Number(n || 0).toLocaleString("fa-IR");
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function formatDateFa(iso: string) {
    try {
        const d = new Date(iso + "T00:00:00Z");
        return d.toLocaleDateString("fa-IR");
    } catch {
        return iso;
    }
}

export default function PriceHistoryChart({
    points,
}: {
    points: PriceHistoryPointDto[];
}) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const data = useMemo(() => {
        const cleaned = (points ?? []).filter((p) => Number(p.maxEffectivePrice) >= 0);
        return cleaned;
    }, [points]);

    const maxY = useMemo(() => {
        const m = Math.max(0, ...data.map((d) => d.maxEffectivePrice || 0));
        return m <= 0 ? 1 : Math.ceil(m * 1.08);
    }, [data]);

    const svg = useMemo(() => {
        const W = 920;
        const H = 360;
        const padL = 84;
        const padR = 24;
        const padT = 18;
        const padB = 54;

        const innerW = W - padL - padR;
        const innerH = H - padT - padB;

        const n = data.length;
        const xAt = (i: number) => (n <= 1 ? padL : padL + (i / (n - 1)) * innerW);
        const yAt = (v: number) => padT + (1 - v / maxY) * innerH;

        const pathD =
            n === 0
                ? ""
                : data
                    .map((p, i) => {
                        const x = xAt(i);
                        const y = yAt(p.maxEffectivePrice || 0);
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ");

        const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
            const val = Math.round(maxY * t);
            return {
                y: yAt(val),
                val,
            };
        });

        const xLabelEvery = n <= 8 ? 1 : n <= 30 ? 5 : Math.ceil(n / 8);

        return {
            W,
            H,
            padL,
            padR,
            padT,
            padB,
            innerW,
            innerH,
            xAt,
            yAt,
            pathD,
            yTicks,
            xLabelEvery,
        };
    }, [data, maxY]);

    const onMove = (clientX: number) => {
        if (!wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const x = clientX - r.left;
        const n = data.length;
        if (n === 0) return;

        const idxFloat =
            n <= 1
                ? 0
                : ((x - svg.padL) / (svg.W - svg.padL - svg.padR)) * (n - 1);

        const idx = clamp(Math.round(idxFloat), 0, n - 1);
        setHoverIndex(idx);
    };

    const hovered = hoverIndex == null ? null : data[hoverIndex] ?? null;

    return (
        <div className="relative" ref={wrapRef}>
            <svg
                viewBox={`0 0 ${svg.W} ${svg.H}`}
                className="w-full h-auto select-none"
                onMouseMove={(e) => onMove(e.clientX)}
                onMouseLeave={() => setHoverIndex(null)}
                onTouchStart={(e) => onMove(e.touches[0].clientX)}
                onTouchMove={(e) => onMove(e.touches[0].clientX)}
            >
                {/* grid + y labels */}
                {svg.yTicks.map((t, i) => (
                    <g key={i}>
                        <line
                            x1={svg.padL}
                            x2={svg.W - svg.padR}
                            y1={t.y}
                            y2={t.y}
                            stroke="var(--color-neutral-100)"
                            strokeWidth="1"
                        />
                        <text
                            x={svg.padL - 10}
                            y={t.y}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fontSize="12"
                            fill="var(--color-neutral-500)"
                            style={{ fontFamily: "var(--font-iransans)" }}
                        >
                            {toFaNumber(t.val)} تومان
                        </text>
                    </g>
                ))}

                {/* x labels */}
                {data.map((p, i) => {
                    if (i % svg.xLabelEvery !== 0 && i !== data.length - 1) return null;
                    const x = svg.xAt(i);
                    return (
                        <text
                            key={p.date + i}
                            x={x}
                            y={svg.H - 22}
                            textAnchor="middle"
                            fontSize="11"
                            fill="var(--color-neutral-500)"
                            style={{ fontFamily: "var(--font-iransans)" }}
                        >
                            {formatDateFa(p.date)}
                        </text>
                    );
                })}

                {/* line */}
                <path
                    d={svg.pathD}
                    fill="none"
                    stroke="var(--color-secondary-500)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* points */}
                {data.map((p, i) => {
                    const x = svg.xAt(i);
                    const y = svg.yAt(p.maxEffectivePrice || 0);
                    const active = hoverIndex === i;
                    return (
                        <circle
                            key={p.date + "_pt_" + i}
                            cx={x}
                            cy={y}
                            r={active ? 6 : 4}
                            fill="white"
                            stroke="var(--color-secondary-500)"
                            strokeWidth={active ? 3 : 2}
                        />
                    );
                })}

                {/* hover vertical line */}
                {hoverIndex != null && data[hoverIndex] && (
                    <line
                        x1={svg.xAt(hoverIndex)}
                        x2={svg.xAt(hoverIndex)}
                        y1={svg.padT}
                        y2={svg.H - svg.padB}
                        stroke="var(--color-neutral-200)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                )}
            </svg>

            {/* tooltip */}
            {hovered && (
                <div className="pointer-events-none absolute top-3 left-3 w-[320px] rounded-2xl bg-white shadow-[var(--shadow-modal)] border border-[var(--color-neutral-200)] p-4">
                    <div className="text-body-2 text-neutral-700 [font-family:var(--font-iransans)]">
                        {formatDateFa(hovered.date)}
                    </div>

                    <div className="mt-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-h5-regular-180 text-neutral-850 [font-family:var(--font-iransans)] truncate">
                                {hovered.maxVendorName ?? "نامشخص"}
                            </div>
                            <div className="mt-1 text-body-2 text-neutral-600 [font-family:var(--font-iransans)]">
                                بیشترین قیمت ثبت‌شده در این تاریخ
                            </div>
                        </div>

                        <div className="shrink-0 text-h4 text-neutral-850 [font-family:var(--font-iransans)]">
                            {toFaNumber(hovered.maxEffectivePrice)} تومان
                        </div>
                    </div>

                    {hovered.offers?.length > 1 && (
                        <div className="mt-3 border-t border-[var(--color-neutral-100)] pt-3">
                            <div className="text-[11px] text-neutral-500 [font-family:var(--font-iransans)] mb-2">
                                قیمت فروشنده‌ها در این تاریخ
                            </div>
                            <div className="space-y-1">
                                {hovered.offers.slice(0, 6).map((o) => (
                                    <div key={o.vendorId} className="flex items-center justify-between gap-3">
                                        <div className="text-[12px] text-neutral-700 [font-family:var(--font-iransans)] truncate">
                                            {o.vendorName}
                                        </div>
                                        <div className="text-[12px] text-neutral-850 [font-family:var(--font-iransans)]">
                                            {toFaNumber(o.effectivePrice)} تومان
                                        </div>
                                    </div>
                                ))}
                                {hovered.offers.length > 6 && (
                                    <div className="text-[11px] text-neutral-500 [font-family:var(--font-iransans)]">
                                        +{toFaNumber(hovered.offers.length - 6)} فروشنده دیگر
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* empty state */}
            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-body-2 text-neutral-500 [font-family:var(--font-iransans)]">
                    داده‌ای برای نمایش وجود ندارد
                </div>
            )}
        </div>
    );
}