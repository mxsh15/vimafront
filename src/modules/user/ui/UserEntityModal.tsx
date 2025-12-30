"use client";

import { useState } from "react";
import { EntityFormModal } from "@/shared/components/EntityFormModal";
import { upsertUserFormAction } from "../actions";
import type { UserDto } from "../types";
import type { RoleOptionDto } from "../../role/types";
import type { VendorOptionDto } from "../../vendor/types";
import { MultiSelectDropdown } from "@/shared/components/MultiSelectDropdown";

type UserEntityModalProps = {
  open: boolean;
  onClose: () => void;
  user?: UserDto;
  roleOptions?: RoleOptionDto[];
  vendorOptions?: VendorOptionDto[];
};

export function UserEntityModal({
  open,
  onClose,
  user,
  roleOptions = [],
  vendorOptions = [],
}: UserEntityModalProps) {
  const isEdit = !!user;

  const [passwordValue, setPasswordValue] = useState("");
  const showPasswordConfirm = !isEdit || passwordValue.length > 0;

  return (
    <EntityFormModal
      open={open}
      onClose={onClose}
      isEdit={isEdit}
      entityLabelFa="کاربر"
      onSubmit={async (formData) => {
        await upsertUserFormAction(formData);
      }}
    >
      {() => (
        <>
          <input type="hidden" name="id" defaultValue={user?.id ?? ""} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">ایمیل *</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={user?.email ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="example@email.com"
                autoComplete="email"
              />
            </label>

            {/* ✅ Password */}
            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                {isEdit ? "رمز عبور (خالی بگذارید برای عدم تغییر)" : "رمز عبور *"}
              </span>
              <input
                name="password"
                type="password"
                required={!isEdit}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="حداقل ۶ کاراکتر"
                autoComplete={isEdit ? "new-password" : "new-password"}
              />
            </label>

            {showPasswordConfirm && (
              <label className="block text-right">
                <span className="mb-1 block text-sm text-gray-700">
                  {isEdit ? "تکرار رمز عبور (فقط در صورت تغییر)" : "تکرار رمز عبور *"}
                </span>
                <input
                  name="passwordConfirm"
                  type="password"
                  required={!isEdit ? true : passwordValue.length > 0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="تکرار رمز عبور"
                  autoComplete="new-password"
                />
              </label>
            )}

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">نام *</span>
              <input
                name="firstName"
                required
                defaultValue={user?.firstName ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="نام"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">نام خانوادگی *</span>
              <input
                name="lastName"
                required
                defaultValue={user?.lastName ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="نام خانوادگی"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">شماره تلفن</span>
              <input
                name="phoneNumber"
                type="tel"
                defaultValue={user?.phoneNumber ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="09123456789"
                autoComplete="tel"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">نقش (UserRole)</span>
              <select
                name="role"
                defaultValue={user?.role ?? 0}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>مشتری</option>
                <option value={1}>فروشنده</option>
                <option value={2}>مدیر</option>
              </select>
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">نقش (جدول Role)</span>
              <select
                name="roleId"
                defaultValue={user?.roleId ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">بدون نقش</option>
                {roleOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">فروشگاه‌ها</span>

              <MultiSelectDropdown
                name="vendorIds"
                options={vendorOptions.map((v) => ({
                  value: v.id,
                  label: v.storeName,
                }))}
                defaultValues={user?.vendorIds ?? []}
                placeholder="انتخاب فروشگاه‌ها"
                searchPlaceholder="جستجو فروشگاه..."
              />

              <div className="mt-1 text-xs text-gray-500">
                هر تعداد فروشگاه لازم داری انتخاب کن. برای حذف هم از چیپ‌ها (×) استفاده کن.
              </div>
            </label>


            {isEdit && (
              <label className="block text-right sm:col-span-2">
                <span className="mb-1 block text-sm text-gray-700">وضعیت</span>
                <select
                  name="status"
                  defaultValue={user?.status ? "true" : "false"}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </select>
              </label>
            )}
          </div>
        </>
      )}
    </EntityFormModal>
  );
}
