"use client";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Portal,
} from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";

type ExtraAction = {
  label: string;
  onClick: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
};

type RowActionsMenuProps = {
  onEdit?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  editLabel?: string;
  deleteLabel?: string;

  // ✅ new: اکشن‌های بیشتر
  extraActions?: ExtraAction[];
};

export function RowActionsMenu({
  onEdit,
  onDelete,
  editLabel = "ویرایش",
  deleteLabel = "حذف",
  extraActions = [],
}: RowActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    top: 0,
    left: 0,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      zIndex: 50,
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handler = () => updatePosition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [mounted, updatePosition]);

  const hasAnyItem = Boolean(onEdit || onDelete || extraActions.length);

  if (!hasAnyItem) return null;

  return (
    <Menu as="div" className="inline-block text-left">
      {({ open }: { open: boolean }) => (
        <>
          <MenuButton
            ref={buttonRef}
            onClick={updatePosition}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-slate-500" />
          </MenuButton>

          {mounted && (
            <Portal>
              {open && (
                <MenuItems
                  style={menuStyle}
                  className="mt-1 w-44 origin-top-right rounded-2xl bg-white py-1 text-xs shadow-lg ring-1 ring-slate-200 focus:outline-none"
                >
                  {onEdit && (
                    <MenuItem>
                      {({ active }: { active: boolean }) => (
                        <button
                          type="button"
                          onClick={onEdit}
                          className={clsx(
                            "flex w-full items-center justify-between px-3 py-1.5 text-right",
                            active && "bg-slate-50 text-slate-900"
                          )}
                        >
                          <span>{editLabel}</span>
                          <PencilSquareIcon className="h-4 w-4 text-slate-400" />
                        </button>
                      )}
                    </MenuItem>
                  )}

                  {extraActions.map((a, idx) => (
                    <MenuItem key={idx} disabled={a.disabled}>
                      {({
                        active,
                        disabled,
                      }: {
                        active: boolean;
                        disabled: boolean;
                      }) => (
                        <button
                          type="button"
                          onClick={a.onClick}
                          disabled={disabled}
                          className={clsx(
                            "flex w-full items-center justify-between px-3 py-1.5 text-right",
                            a.danger ? "text-red-600" : "text-slate-700",
                            active && (a.danger ? "bg-red-50" : "bg-slate-50"),
                            disabled && "opacity-50 cursor-not-allowed",
                            a.className
                          )}
                        >
                          <span>{a.label}</span>
                          <span className="text-[10px] text-slate-400">↵</span>
                        </button>
                      )}
                    </MenuItem>
                  ))}

                  {onDelete && (
                    <MenuItem>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={onDelete}
                          className={clsx(
                            "flex w-full items-center justify-between px-3 py-1.5 text-right text-red-600",
                            active && "bg-red-50"
                          )}
                        >
                          <span>{deleteLabel}</span>
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </MenuItem>
                  )}
                </MenuItems>
              )}
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
}
