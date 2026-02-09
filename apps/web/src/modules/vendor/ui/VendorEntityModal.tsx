"use client";

import { EntityFormModal } from "@/shared/components/EntityFormModal";
import { upsertVendorFormAction } from "../actions";
import type { VendorDto } from "../types";
import { UserSelect } from "@/modules/user/ui/UserSelect";
import { UserOptionDto } from "@/modules/user/types";

type VendorEntityModalProps = {
  open: boolean;
  onClose: () => void;
  vendor?: VendorDto;
  userOptions?: UserOptionDto[];
};

export function VendorEntityModal({
  open,
  onClose,
  vendor,
  userOptions = [],
}: VendorEntityModalProps) {
  const isEdit = Boolean(vendor);

  return (
    <EntityFormModal
      open={open}
      onClose={onClose}
      isEdit={isEdit}
      entityLabelFa="فروشنده"
      onSubmit={async (formData) => {
        await upsertVendorFormAction(formData);
      }}
    >
      {() => (
        <>
          <input type="hidden" name="id" defaultValue={vendor?.id ?? ""} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                نام فروشگاه *
              </span>
              <input
                name="storeName"
                required
                defaultValue={vendor?.storeName ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="مثال: فروشگاه الکترونیک"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                نام حقوقی
              </span>
              <input
                name="legalName"
                defaultValue={vendor?.legalName ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="نام شرکت"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                کد ملی / شناسه ملی
              </span>
              <input
                name="nationalId"
                defaultValue={vendor?.nationalId ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="کد ملی"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                شماره تلفن
              </span>
              <input
                name="phoneNumber"
                type="tel"
                defaultValue={vendor?.phoneNumber ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="021-12345678"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                شماره موبایل
              </span>
              <input
                name="mobileNumber"
                type="tel"
                defaultValue={vendor?.mobileNumber ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="09123456789"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1 block text-sm text-gray-700">
                درصد کمیسیون پیش‌فرض
              </span>
              <input
                name="defaultCommissionPercent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={vendor?.defaultCommissionPercent ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5.5"
              />
            </label>

            {!isEdit && (
              <label className="block text-right sm:col-span-2">
                <UserSelect
                  name="ownerUserId"
                  label="مالک فروشنده"
                  options={userOptions}
                  defaultValue={null}
                />
              </label>
            )}

            {isEdit && (
              <div className="sm:col-span-2 text-sm text-gray-600">
                مالک فعلی:{" "}
                <span className="font-medium">
                  {vendor?.ownerUserName ?? "—"}
                </span>
              </div>
            )}

            {isEdit && (
              <label className="block text-right sm:col-span-2">
                <span className="mb-1 block text-sm text-gray-700">
                  وضعیت
                </span>
                <select
                  name="status"
                  defaultValue={vendor?.status ? "true" : "false"}
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

