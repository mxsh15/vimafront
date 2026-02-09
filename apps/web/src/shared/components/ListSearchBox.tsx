"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

function debounce(fn: (...args: any[]) => void, delay = 500) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

type ListSearchBoxProps = {
  placeholder?: string;
  paramKey?: string;
  className?: string;
};

export function ListSearchBox({
  placeholder = "جستجو...",
  paramKey = "q",
  className = "",
}: ListSearchBoxProps) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);

  const debouncedSearch = useCallback(
    debounce((val: string) => {
      const p = new URLSearchParams(params.toString());

      if (val && val.trim()) p.set("q", val.trim());
      else p.delete("q");

      p.set("page", "1");
      const qs = p.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.push(url);
    }, 500),
    [params, pathname, router]
  );
  return (
    <div className={`relative w-72 ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 text-xs outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        dir="rtl"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-[11px] text-white shadow-sm">
        🔍
      </span>
    </div>
  );
}
