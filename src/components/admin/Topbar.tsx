"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const displayName = user?.fullName || user?.firstName || "کاربر";

  return (
    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <form action="#" method="GET" className="grid flex-1 grid-cols-1">
        <input
          name="search"
          type="search"
          placeholder="جستجو کنید..."
          aria-label="Search"
          className="col-start-1 row-start-1 block size-full bg-white pr-8 text-base text-gray-900 placeholder:text-gray-400 sm:text-sm"
        />
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
        />
      </form>
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon aria-hidden="true" className="size-6" />
        </button>
        <div
          aria-hidden
          className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
        />
        {mounted ? (
          <Menu as="div" className="relative">
            <MenuButton className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <img
                alt=""
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="size-8 rounded-full bg-gray-50"
              />
              <span className="hidden lg:flex lg:items-center">
                <span
                  aria-hidden
                  className="mr-4 text-sm font-semibold text-gray-900"
                >
                  {displayName}
                </span>
                <ChevronDownIcon
                  aria-hidden
                  className="mr-2 size-5 text-gray-400"
                />
              </span>
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 ring-1 ring-gray-900/5 shadow-lg data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                <a
                  href="#"
                  className="block px-3 py-1 text-sm text-gray-900 data-focus:bg-gray-50"
                >
                  پروفایل
                </a>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={handleLogout}
                  className="block w-full text-right px-3 py-1 text-sm text-gray-900 data-focus:bg-gray-50"
                >
                  خروج
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        ) : (
          <div className="-m-1.5 flex items-center p-1.5">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="size-8 rounded-full bg-gray-50"
            />
            <span className="hidden lg:flex lg:items-center">
              <span
                aria-hidden
                className="mr-4 text-sm font-semibold text-gray-900"
              >
                {displayName}
              </span>
              <ChevronDownIcon
                aria-hidden
                className="mr-2 size-5 text-gray-400"
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
