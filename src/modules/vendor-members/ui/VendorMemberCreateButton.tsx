"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { PlusIcon } from "lucide-react";
import { addVendorMemberAction } from "../actions";

type UserOption = { id: string; fullName: string; email: string };

export function VendorMemberCreateButton({
    vendorId,
    userOptions,
}: {
    vendorId: string;
    userOptions: UserOption[];
}) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("Staff");
    const [isActive, setIsActive] = useState(true);

    const canSubmit = !!userId && !!role.trim();

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-[11px] text-white"
            >
                <PlusIcon size={14} />
                افزودن عضو
            </button>

            <Dialog open={open} onClose={setOpen} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/40" />
                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
                        <DialogPanel className="w-full max-w-2xl rounded-xl bg-[#f0f0f1] shadow-xl">
                            <div className="border-b border-gray-300 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-sm font-semibold">افزودن عضو</DialogTitle>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="rounded border bg-white px-3 py-1 text-xs"
                                            onClick={() => setOpen(false)}
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!canSubmit || pending}
                                            className="rounded bg-blue-600 px-4 py-1 text-xs text-white disabled:opacity-60"
                                            onClick={() => {
                                                if (!canSubmit) return;
                                                startTransition(async () => {
                                                    await addVendorMemberAction(vendorId, {
                                                        userId,
                                                        role: role.trim(),
                                                        isActive,
                                                    });
                                                    setOpen(false);
                                                    setUserId("");
                                                    setRole("Staff");
                                                    setIsActive(true);
                                                });
                                            }}
                                        >
                                            {pending ? "در حال ثبت..." : "ثبت"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="block text-xs mb-1">کاربر</label>
                                    <select
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                    >
                                        <option value="">انتخاب کنید...</option>
                                        {userOptions.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.fullName} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="block text-xs mb-1">نقش</label>
                                        <input
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            placeholder="Owner / Manager / Staff"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            id="isActive"
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <label htmlFor="isActive" className="text-xs">
                                            فعال باشد
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
