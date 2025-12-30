"use client";

import { useState, useEffect } from "react";
import { EntityFormModal } from "@/shared/components/EntityFormModal";
import { upsertRoleFormAction } from "../actions";
import type { RoleDetailDto } from "../types";
import type { PermissionOptionDto } from "../../permission/types";
import { bffFetch } from "@/lib/fetch-bff";

type RoleEntityModalProps = {
  open: boolean;
  onClose: () => void;
  role?: RoleDetailDto;
};

export function RoleEntityModal({
  open,
  onClose,
  role,
}: RoleEntityModalProps) {
  const isEdit = !!role;
  const [permissionOptions, setPermissionOptions] = useState<PermissionOptionDto[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    role?.permissions.map((p) => p.id) || []
  );

  useEffect(() => {
    if (open) {
      setLoadingPermissions(true);
      // استفاده از bffFetch برای client component
      bffFetch<{
        items: Array<{
          id: string;
          name: string;
          displayName?: string | null;
          category?: string | null;
          status: boolean;
        }>;
        totalCount: number;
      }>(
        "/api/permissions?page=1&pageSize=1000&status=active"
      )
        .then((res) => {
          setPermissionOptions(
            res.items
              .filter((p) => p.status) // فقط دسترسی‌های فعال
              .map((p) => ({
                id: p.id,
                name: p.name,
                displayName: p.displayName || null,
                category: p.category || null,
              }))
          );
        })
        .catch((error) => {
          console.error("Failed to load permissions:", error);
          setPermissionOptions([]);
        })
        .finally(() => {
          setLoadingPermissions(false);
        });
    }
  }, [open]);

  const groupedPermissions = permissionOptions.reduce((acc, perm) => {
    const category = perm.category || "سایر";
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, PermissionOptionDto[]>);

  return (
    <EntityFormModal
      open={open}
      onClose={onClose}
      isEdit={isEdit}
      entityLabelFa="نقش"
      onSubmit={async (formData) => {
        formData.set("permissionIds", selectedPermissionIds.join(","));
        await upsertRoleFormAction(formData);
      }}
    >
      {() => (
        <>
          <input type="hidden" name="id" defaultValue={role?.id ?? ""} />

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-right sm:col-span-2">
                <span className="mb-1 block text-sm text-gray-700">
                  نام نقش *
                </span>
                <input
                  name="name"
                  required
                  defaultValue={role?.name ?? ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: کاربر عادی"
                />
              </label>

              <label className="block text-right sm:col-span-2">
                <span className="mb-1 block text-sm text-gray-700">
                  توضیحات
                </span>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={role?.description ?? ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="توضیحات نقش..."
                />
              </label>

              {isEdit && (
                <label className="block text-right sm:col-span-2">
                  <span className="mb-1 block text-sm text-gray-700">
                    وضعیت
                  </span>
                  <select
                    name="status"
                    defaultValue={role?.status ? "true" : "false"}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">فعال</option>
                    <option value="false">غیرفعال</option>
                  </select>
                </label>
              )}
            </div>

            <div className="block text-right sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                دسترسی‌ها
              </span>
              <div className="max-h-64 overflow-y-auto rounded-md border border-gray-300 p-3">
                {loadingPermissions ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    در حال بارگذاری دسترسی‌ها...
                  </div>
                ) : permissionOptions.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    هیچ دسترسی‌ای یافت نشد. لطفاً ابتدا دسترسی‌ها را در بخش "دسترسی‌ها" ایجاد کنید.
                  </div>
                ) : (
                  Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="mb-4">
                      <h5 className="mb-2 text-xs font-semibold text-gray-600">
                        {category}
                      </h5>
                      <div className="space-y-1">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissionIds.includes(perm.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissionIds([...selectedPermissionIds, perm.id]);
                                } else {
                                  setSelectedPermissionIds(
                                    selectedPermissionIds.filter((id) => id !== perm.id)
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">
                              {perm.displayName || perm.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </EntityFormModal>
  );
}

