"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavItem } from "@/lib/adminNav";

function clsx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function NavItem({ item }: { item: AdminNavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <li>
      <Link
        href={item.href}
        className={clsx(
          active
            ? "bg-gray-50 text-indigo-600"
            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold"
        )}
      >
        <item.icon
          aria-hidden="true"
          className={clsx(
            active
              ? "text-indigo-600"
              : "text-gray-400 group-hover:text-indigo-600",
            "size-6 shrink-0"
          )}
        />
        {item.name}
      </Link>
    </li>
  );
}
