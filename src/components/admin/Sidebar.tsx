"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import NavItem from "./NavItem";
import { adminNavTop, adminNavGroups } from "@/lib/adminNav";
import { usePermissions } from "@/context/PermissionContext";
import { useAuth } from "@/context/AuthContext";
import {
  getRouteViewPermission,
  routeRequiresPermission,
} from "@/lib/routePermissions";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { user, loading: authLoading } = useAuth();
  const loading = permissionsLoading || authLoading;

  const { filteredTop, filteredGroups } = useMemo(() => {
    // در حالت loading فقط داشبورد نمایش داده شود
    if (loading) {
      return {
        filteredTop: adminNavTop.filter((x) => x.href === "/admin"),
        filteredGroups: [],
      };
    }

    const canSee = (href: string) => {
      if (!routeRequiresPermission(href)) return true;
      const required = getRouteViewPermission(href);
      if (!required) return false;
      return hasPermission(required);
    };

    const filteredTop = adminNavTop.filter((i) => canSee(i.href));

    const filteredGroups = adminNavGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => canSee(i.href)),
      }))
      .filter((g) => g.items.length > 0); // گروه خالی نمایش داده نشود

    return { filteredTop, filteredGroups };
  }, [hasPermission, loading, user]);

  const NavContent = (
    <nav className="flex-1">
      <ul role="list" className="-mx-2 space-y-1">
        {/* آیتم‌های بالا */}
        {filteredTop.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* گروه‌ها */}
        {filteredGroups.map((group) => (
          <li key={group.title} className="mt-3">
            <div className="px-2 py-2 text-[11px] font-semibold text-slate-400">
              {group.title}
            </div>
            <ul role="list" className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div>
      {/* Mobile drawer */}
      <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 data-closed:opacity-0">
                <button onClick={() => setOpen(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              <div className="flex h-16 items-center">
                <img
                  alt="Admin"
                  src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </div>

              {NavContent}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-l border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 items-center">
            <img
              alt="Admin"
              src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </div>

          {NavContent}
        </div>
      </div>

      {/* Top bar */}
      <div className="lg:pr-72">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="size-6" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
