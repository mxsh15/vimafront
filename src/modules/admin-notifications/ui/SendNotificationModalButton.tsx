"use client";

import { useMemo, useState, useTransition } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { PlusIcon } from "lucide-react";
import type { AdminSendNotificationDto, NotificationType } from "../types";
import { sendAdminNotificationAction } from "../actions";

type UserOption = { id: string; fullName: string; email: string };
type RoleOption = { id: string; name: string };
type VendorOption = { id: string; storeName: string };

function typeLabel(t: NotificationType) {
    switch (t) {
        case 0: return "سفارش";
        case 1: return "پرداخت";
        case 2: return "ارسال";
        case 3: return "محصول";
        case 4: return "سیستمی";
        case 5: return "فروشنده";
        default: return "سیستمی";
    }
}

export function SendNotificationModalButton({
    userOptions,
    roleOptions,
    vendorOptions,
}: {
    userOptions: UserOption[];
    roleOptions: RoleOption[];
    vendorOptions: VendorOption[];
}) {
    const [pending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState<AdminSendNotificationDto>({
        target: "All",
        title: "",
        message: "",
        type: 4,
        actionUrl: null,
        relatedEntityType: null,
        relatedEntityId: null,
    });

    const canSubmit = useMemo(() => {
        if (!form.title.trim()) return false;
        if (!form.message.trim()) return false;

        if (form.target === "User" && !form.userId) return false;
        if (form.target === "Role" && !form.roleId) return false;
        if (form.target === "Vendor" && !form.vendorId) return false;

        return true;
    }, [form]);

    const submit = () => {
        if (!canSubmit) return;
        startTransition(async () => {
            await sendAdminNotificationAction({
                ...form,
                title: form.title.trim(),
                message: form.message.trim(),
                actionUrl: form.actionUrl?.trim() || null,
                relatedEntityType: form.relatedEntityType?.trim() || null,
                relatedEntityId: form.relatedEntityId?.trim() || null,
            });
            setOpen(false);
            setForm({
                target: "All",
                title: "",
                message: "",
                type: 4,
                actionUrl: null,
                relatedEntityType: null,
                relatedEntityId: null,
            });
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-[11px] text-white"
            >
                <PlusIcon size={14} />
                ارسال اعلان
            </button>

            <Dialog open={open} onClose={setOpen} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/40" />
                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                        <DialogPanel className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-[#f0f0f1] shadow-xl sm:my-6">

                            <div className="sticky top-0 z-10 border-b border-gray-300 bg-[#f0f0f1] px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-sm font-semibold">ارسال اعلان</DialogTitle>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="rounded border bg-white px-3 py-1 text-xs"
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            type="button"
                                            disabled={pending || !canSubmit}
                                            onClick={submit}
                                            className="rounded bg-blue-600 px-4 py-1 text-xs text-white disabled:opacity-60"
                                        >
                                            {pending ? "در حال ارسال..." : "ارسال"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[85vh] overflow-y-auto p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded bg-white p-3 space-y-2">
                                        <label className="block text-xs">هدف</label>
                                        <select
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.target}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    target: e.target.value as any,
                                                    userId: null,
                                                    roleId: null,
                                                    vendorId: null,
                                                })
                                            }
                                        >
                                            <option value="All">همه کاربران</option>
                                            <option value="User">یک کاربر</option>
                                            <option value="Role">یک نقش</option>
                                            <option value="Vendor">یک فروشنده</option>
                                        </select>

                                        {form.target === "User" && (
                                            <>
                                                <label className="block text-xs">کاربر</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.userId ?? ""}
                                                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                                >
                                                    <option value="">انتخاب کنید...</option>
                                                    {userOptions.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.fullName} ({u.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}

                                        {form.target === "Role" && (
                                            <>
                                                <label className="block text-xs">نقش</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.roleId ?? ""}
                                                    onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                                                >
                                                    <option value="">انتخاب کنید...</option>
                                                    {roleOptions.map((r) => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}

                                        {form.target === "Vendor" && (
                                            <>
                                                <label className="block text-xs">فروشنده</label>
                                                <select
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                                    value={form.vendorId ?? ""}
                                                    onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                                                >
                                                    <option value="">انتخاب کنید...</option>
                                                    {vendorOptions.map((v) => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.storeName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}
                                    </div>

                                    <div className="rounded bg-white p-3 space-y-2">
                                        <label className="block text-xs">نوع اعلان</label>
                                        <select
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={String(form.type)}
                                            onChange={(e) =>
                                                setForm({ ...form, type: Number(e.target.value) as NotificationType })
                                            }
                                        >
                                            {[0, 1, 2, 3, 4, 5].map((t) => (
                                                <option key={t} value={t}>
                                                    {typeLabel(t as any)}
                                                </option>
                                            ))}
                                        </select>

                                        <label className="block text-xs">عنوان</label>
                                        <input
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />

                                        <label className="block text-xs">متن پیام</label>
                                        <textarea
                                            rows={4}
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        />

                                        <label className="block text-xs">ActionUrl (اختیاری)</label>
                                        <input
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            value={form.actionUrl ?? ""}
                                            onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                                        />
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
