"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = {
  label: string;
  value: string | null;
};

type StatusFilterBarProps = {
  paramKey?: string; 
  options: Option[];
  totalLabel?: string;
};

export function StatusFilterBar({
  paramKey = "status",
  options,
  totalLabel,
}: StatusFilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const current = params.get(paramKey);

  function handleClick(val: string | null) {
    const p = new URLSearchParams(params.toString());
    if (val) {
      p.set(paramKey, val);
    } else {
      p.delete(paramKey);
    }
    p.set("page", "1");
    const qs = p.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.push(url);
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <span>نمایش:</span>
        {options.map((o) => {
          const isActive =
            (o.value === null && !current) || (o.value && o.value === current);
          const base =
            "rounded-full px-3 py-1 text-[11px] transition-colors border";
          const active =
            "bg-slate-900 text-white border-slate-900 hover:bg-slate-800";
          const inactive =
            "border-slate-200 hover:bg-slate-50 bg-transparent text-slate-600";
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => handleClick(o.value)}
              className={`${base} ${isActive ? active : inactive}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {totalLabel && (
        <div className="text-[11px] text-slate-400">{totalLabel}</div>
      )}
    </div>
  );
}
