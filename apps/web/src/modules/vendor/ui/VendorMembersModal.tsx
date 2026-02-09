"use client";

import { useEffect, useState, useTransition } from "react";
import type { VendorMemberDto } from "../types";
import type { UserOptionDto } from "@/modules/user/types";
import { listVendorMembers, addVendorMember, removeVendorMember } from "../api";

type VendorMembersModalProps = {
    open: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
    userOptions: UserOptionDto[];
};

export function VendorMembersModal({
    open,
    onClose,
    vendorId,
    vendorName,
    userOptions,
}: VendorMembersModalProps) {
    const [members, setMembers] = useState<VendorMemberDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [role, setRole] = useState<string>("Manager");
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await listVendorMembers(vendorId);
                setMembers(res);
            } catch (err: any) {
                console.error(err);
                setError(err.message ?? "خطا در دریافت اعضای فروشنده");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [vendorId]);

    function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedUserId) return;

        startTransition(async () => {
            try {
                setError(null);
                await addVendorMember(vendorId, selectedUserId, role);

                const refreshed = await listVendorMembers(vendorId);
                setMembers(refreshed);

                setSelectedUserId("");
                setRole("Manager");
            } catch (err: any) {
                console.error(err);
                setError(err.message ?? "خطا در افزودن عضو جدید");
            }
        });
    }

    function handleRemoveMember(userId: string) {
        const ok = window.confirm("آیا از حذف این عضو مطمئن هستید؟");
        if (!ok) return;

        startTransition(async () => {
            try {
                setError(null);
                await removeVendorMember(vendorId, userId);
                setMembers((prev) => prev.filter((m) => m.userId !== userId));
            } catch (err: any) {
                console.error(err);
                setError(err.message ?? "خطا در حذف عضو");
            }
        });
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
            <div
                className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-lg"
                dir="rtl"
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                        مدیریت اعضای فروشنده «{vendorName}»
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <p className="mb-2 text-xs text-red-500">
                        {error}
                    </p>
                )}

                {/* فرم افزودن عضو جدید */}
                <form
                    onSubmit={handleAddMember}
                    className="mb-4 flex flex-wrap items-end gap-3"
                >
                    <div className="min-w-[220px] flex-1">
                        <label className="mb-1 block text-[11px] text-slate-600">
                            کاربر
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">انتخاب کاربر...</option>
                            {userOptions.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.fullName}
                                    {u.email ? ` (${u.email})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] text-slate-600">
                            نقش در فروشنده
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Owner">مالک</option>
                            <option value="Manager">مدیر</option>
                            <option value="Staff">کاربر</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={pending || !selectedUserId}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                        >
                            {pending ? "در حال افزودن..." : "افزودن عضو"}
                        </button>
                    </div>
                </form>

                {/* لیست اعضا */}
                <div className="rounded-xl border border-slate-200">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                            در حال بارگذاری اعضا...
                        </div>
                    ) : members.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                            هنوز عضوی برای این فروشنده ثبت نشده است.
                        </div>
                    ) : (
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-3 py-2 font-medium text-slate-600">
                                        نام
                                    </th>
                                    <th className="px-3 py-2 font-medium text-slate-600">
                                        ایمیل
                                    </th>
                                    <th className="px-3 py-2 font-medium text-slate-600">
                                        نقش
                                    </th>
                                    <th className="px-3 py-2 font-medium text-slate-600">
                                        وضعیت
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-600">
                                        عملیات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m) => (
                                    <tr key={m.userId} className="border-b border-slate-100">
                                        <td className="px-3 py-2">{m.fullName}</td>
                                        <td className="px-3 py-2 text-slate-500">
                                            {m.userEmail}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700">
                                                {m.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${m.isActive
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-slate-50 text-slate-400"
                                                    }`}
                                            >
                                                {m.isActive ? "فعال" : "غیرفعال"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-left">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(m.userId)}
                                                className="rounded-xl border border-red-100 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                                            >
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
}
