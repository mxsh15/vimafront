"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type MultiSelectOption = {
    value: string;
    label: string;
    meta?: string; // اختیاری (مثلاً ایمیل/کد/شهر)
};

export function MultiSelectDropdown({
    name,
    options,
    defaultValues = [],
    placeholder = "انتخاب کنید...",
    searchPlaceholder = "جستجو...",
    disabled,
}: {
    /** اسم فیلد برای FormData. ما برای هر انتخاب یک input hidden با همین name می‌سازیم */
    name: string;
    options: MultiSelectOption[];
    defaultValues?: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
}) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<string[]>(defaultValues);

    // اگر defaultValues بعداً عوض شد (مثلاً هنگام باز شدن modal)، sync کن
    useEffect(() => {
        setSelected(defaultValues ?? []);
    }, [defaultValues]);

    // بیرون کلیک شد بسته بشه
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return options;
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(s) ||
                (o.meta ? o.meta.toLowerCase().includes(s) : false)
        );
    }, [options, q]);

    function toggleValue(v: string) {
        setSelected((prev) => {
            const set = new Set(prev);
            if (set.has(v)) set.delete(v);
            else set.add(v);
            return Array.from(set);
        });
    }

    function removeValue(v: string) {
        setSelected((prev) => prev.filter((x) => x !== v));
    }

    const selectedOptions = useMemo(() => {
        const map = new Map(options.map((o) => [o.value, o]));
        return selected
            .map((v) => map.get(v))
            .filter(Boolean) as MultiSelectOption[];
    }, [options, selected]);

    return (
        <div ref={rootRef} className="w-full">
            {/* Hidden inputs to submit */}
            {selected.map((v) => (
                <input key={v} type="hidden" name={name} value={v} />
            ))}

            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((x) => !x)}
                className={`w-full rounded-md border px-3 py-2 text-right text-sm shadow-xs outline-none ${disabled
                        ? "bg-slate-100 text-slate-400 border-slate-200"
                        : "bg-white text-slate-900 border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    }`}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        {selectedOptions.length === 0 ? (
                            <span className="text-slate-500">{placeholder}</span>
                        ) : (
                            <span className="text-slate-900">
                                {selectedOptions.length} مورد انتخاب شد
                            </span>
                        )}
                    </div>
                    <span className="text-slate-500">{open ? "▲" : "▼"}</span>
                </div>
            </button>

            {/* Chips */}
            {selectedOptions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedOptions.map((o) => (
                        <span
                            key={o.value}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
                        >
                            {o.label}
                            <button
                                type="button"
                                onClick={() => removeValue(o.value)}
                                className="rounded-full px-1 text-slate-500 hover:text-slate-800"
                                aria-label="remove"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown */}
            {open && !disabled && (
                <div className="mt-2 rounded-md border border-slate-200 bg-white shadow-lg">
                    <div className="p-2">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="max-h-64 overflow-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="p-3 text-sm text-slate-500">موردی یافت نشد.</div>
                        ) : (
                            filtered.map((o) => {
                                const checked = selectedSet.has(o.value);
                                return (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => toggleValue(o.value)}
                                        className="w-full rounded-md px-2 py-2 text-right text-sm hover:bg-slate-50"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">
                                                    {o.label}
                                                </div>
                                                {o.meta ? (
                                                    <div className="text-xs text-slate-500">{o.meta}</div>
                                                ) : null}
                                            </div>

                                            <div
                                                className={`h-5 w-5 rounded border flex items-center justify-center ${checked
                                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                                        : "border-slate-300 bg-white text-transparent"
                                                    }`}
                                            >
                                                ✓
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 p-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSelected([]);
                                setQ("");
                            }}
                            className="text-xs text-rose-600 hover:underline"
                        >
                            پاک کردن انتخاب‌ها
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
                        >
                            تایید
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
