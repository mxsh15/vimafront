"use client";

import { useId } from "react";
import type { UserSelectProps } from "../types";


export function UserSelect({
    name,
    label = "مالک فروشنده",
    options,
    defaultValue = null,
    required = false,
    disabled = false,
    className = "",
}: UserSelectProps) {
    const id = useId();

    return (
        <label className="block text-right sm:col-span-2">
            {label && (
                <span className="mb-1 block text-sm text-gray-700">{label}</span>
            )}

            <select
                id={id}
                name={name}
                defaultValue={defaultValue ?? ""}
                required={required}
                disabled={disabled}
                className={
                    className ||
                    "w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500"
                }
            >
                <option value="">انتخاب کاربر (اختیاری)</option>
                {options.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.fullName}
                        {u.email ? ` (${u.email})` : ""}
                    </option>
                ))}
            </select>
        </label>
    );
}
