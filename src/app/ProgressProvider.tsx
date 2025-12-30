"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: true,
  speed: 400,
  minimum: 0.1,
});

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    NProgress.start();

    const timer = setTimeout(() => {
      NProgress.done();
    }, 400);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, search]);

  return <>{children}</>;
}
