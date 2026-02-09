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

export default function MediaSearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);

  const debouncedSearch = useCallback(
    debounce((val: string) => {
      const p = new URLSearchParams(params.toString());

      if (val && val.trim()) {
        p.set("q", val.trim());
      } else {
        p.delete("q");
      }
      p.set("page", "1");
      const qs = p.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.push(url);
    }, 500),
    [params, pathname, router]
  );

  return (
    <input
      type="text"
      placeholder="جستجو بر اساس نام یا آدرس فایل..."
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debouncedSearch(e.target.value);
      }}
      className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
      dir="rtl"
    />
  );
}
