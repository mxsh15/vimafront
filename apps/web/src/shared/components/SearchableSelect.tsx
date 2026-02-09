"use client";

import * as React from "react";

type Option = { value: string; label: string };

type Props = {
  name: string; // اسم فیلد فرم (مثلا ownerVendorId)
  options: Option[];
  value: string; // مقدار انتخاب شده
  onChange: (v: string) => void;
  placeholder?: string;
  emptyLabel?: string; // اگر می‌خوای گزینه‌ی خالی داشته باشی (مثل "فروشگاه اصلی")
  disabled?: boolean;
  className?: string;
};

export default function SearchableSelect({
  name,
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید...",
  emptyLabel,
  disabled,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const selected = React.useMemo(() => {
    if (!value) return null;
    return options.find((o) => o.value === value) ?? null;
  }, [value, options]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;
    return options.filter((o) => o.label.toLowerCase().includes(query));
  }, [q, options]);

  return (
    <div className={className}>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] disabled:opacity-60"
      >
        <span className="truncate">
          {selected?.label ??
            (value === "" && emptyLabel ? emptyLabel : placeholder)}
        </span>
        <span className="ml-2 text-gray-500">▾</span>
      </button>

      {open && (
        <div className="relative">
          <div className="absolute z-50 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو..."
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div className="max-h-60 overflow-auto p-1">
              {emptyLabel && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQ("");
                  }}
                  className={`w-full rounded px-2 py-1 text-right text-xs hover:bg-gray-100 ${
                    value === "" ? "bg-gray-100" : ""
                  }`}
                >
                  {emptyLabel}
                </button>
              )}

              {filtered.length === 0 ? (
                <div className="px-2 py-2 text-xs text-gray-500">
                  موردی پیدا نشد
                </div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQ("");
                    }}
                    className={`w-full rounded px-2 py-1 text-right text-xs hover:bg-gray-100 ${
                      o.value === value ? "bg-gray-100" : ""
                    }`}
                  >
                    {o.label}
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 p-1">
              <button
                type="button"
                className="w-full rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setOpen(false);
                  setQ("");
                }}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
