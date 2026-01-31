"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  PieChartIcon,
  ChevronDownIcon,
  Target,
} from "lucide-react";
import SidebarWidget from "./SidebarWidget";
import { usePermissions } from "@/context/PermissionContext";
import {
  getRouteViewPermission,
  routeRequiresPermission,
} from "@/lib/routePermissions";
import { apiFetch } from "@/lib/api";
import type { StoreSettingsDto } from "@/modules/settings/types";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [
      { name: "داشبورد", path: "/admin", pro: false },
      { name: "کتابخانه چند رسانه ای", path: "/admin/media", pro: false },
      { name: "کاربران", path: "/admin/users", pro: false },
      { name: "نقش‌ها", path: "/admin/roles", pro: false },
      { name: "دسترسی‌ها", path: "/admin/permissions", pro: false },
      { name: "فروشندگان", path: "/admin/vendors", pro: false },
      { name: "برندها", path: "/admin/brands", pro: false },
      {
        name: "دسته بندی محصولات",
        path: "/admin/categories",
        pro: false
      },
      {
        name: "ویژگی‌ها",
        path: "/admin/spec-attributes",
        pro: false
      },
      {
        name: "گروه‌های ویژگی",
        path: "/admin/spec-groups",
        pro: false
      },
      { name: "برچسب ها", path: "/admin/tags", pro: false },
      { name: "محصولات", path: "/admin/products", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { permissions, hasPermission, loading: permissionsLoading } = usePermissions();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const [multiVendorEnabled, setMultiVendorEnabled] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    apiFetch<StoreSettingsDto>("settings")
      .then((s) => {
        console.log("[Sidebar] /settings response:", s);
        if (mounted) setMultiVendorEnabled(s.multiVendorEnabled ?? true);
      })
      .catch((err) => {
        console.error("[Sidebar] /settings failed:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);


  const effectiveNavItems = useMemo(() => {
    if (multiVendorEnabled) return navItems;

    // وقتی تک‌فروشنده است، منوی فروشندگان حذف شود
    return navItems.map((g) => ({
      ...g,
      subItems: g.subItems?.filter(
        (x) => x.path !== "/admin/vendors"
      ),
    }));
  }, [multiVendorEnabled]);


  useEffect(() => {
    if (!permissionsLoading) {
      console.log("[Permissions] loaded for current user:", permissions);
    }
  }, [permissionsLoading, permissions]);

  const isSubItemVisible = useCallback(
    (path?: string) => {
      if (!path) return false;

      // حالت لودینگ
      if (permissionsLoading) {
        const requiresPerm = routeRequiresPermission(path);
        const visibleWhileLoading = !requiresPerm;

        if (process.env.NODE_ENV === "development") {
          console.log("[Sidebar:isSubItemVisible:loading]", {
            path,
            requiresPerm,
            visibleWhileLoading,
          });
        }

        return visibleWhileLoading;
      }

      const requiresPerm = routeRequiresPermission(path);

      if (!requiresPerm) {
        if (process.env.NODE_ENV === "development") {
          console.log("[Sidebar:isSubItemVisible]", {
            path,
            requiresPerm: false,
            viewPerm: null,
            hasPerm: null,
            visible: true,
          });
        }
        return true;
      }

      const viewPerm = getRouteViewPermission(path);
      if (!viewPerm) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Sidebar:isSubItemVisible] routeRequiresPermission=true اما viewPerm پیدا نشد", {
            path,
          });
        }
        return false;
      }

      const hasPermForRoute = hasPermission(viewPerm);
      const visible = hasPermForRoute;

      if (process.env.NODE_ENV === "development") {
        console.log("[Sidebar:isSubItemVisible]", {
          path,
          requiresPerm,
          viewPerm,
          hasPerm: hasPermForRoute,
          visible,
        });
      }

      return visible;
    },
    [hasPermission, permissionsLoading]
  );

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // 🔹 ساخت منوها با فیلتر بر اساس پرمیشن
  const buildMenuWithPermissions = useCallback(
    (items: NavItem[]) =>
      items
        .map((nav) => {
          if (!nav.subItems) return nav;

          const visibleSubItems = nav.subItems.filter((sub) =>
            isSubItemVisible(sub.path)
          );

          // اگر هیچ subItem قابل نمایش نیست → کل آیتم مخفی شود
          if (visibleSubItems.length === 0) {
            return null;
          }

          return {
            ...nav,
            subItems: visibleSubItems,
          };
        })
        .filter((nav): nav is NavItem => nav !== null),
    [isSubItemVisible]
  );

  const filteredMainNavItems = useMemo(
    () => buildMenuWithPermissions(effectiveNavItems),
    [buildMenuWithPermissions, effectiveNavItems]
  );

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`] || 0}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // 🔹 وقتی route عوض می‌شود، اگر زیرمنویی شامل مسیر فعال و قابل‌نمایش باشد، بازش می‌کنیم
  useEffect(() => {
    let submenuMatched = false;

    ([
      { type: "main" as const, items: filteredMainNavItems }
    ] as const).forEach(({ type, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          const match = nav.subItems.some(
            (subItem) =>
              isSubItemVisible(subItem.path) && isActive(subItem.path)
          );
          if (match) {
            setOpenSubmenu({ type, index });
            submenuMatched = true;
          }
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [
    pathname,
    isActive,
    filteredMainNavItems,
    isSubItemVisible,
  ]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: el.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, filteredMainNavItems]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 right-0 bg-white dark:bg-gray-900 
        dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 
        border-l border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Target width={150} height={40} className="dark:hidden" />
              <Target width={150} height={40} className="hidden dark:block" />
            </>
          ) : (
            <Target width={150} height={40} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <PieChartIcon />
                )}
              </h2>
              {renderMenuItems(filteredMainNavItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <PieChartIcon />
                )}
              </h2>
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
