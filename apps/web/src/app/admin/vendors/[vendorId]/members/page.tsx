import { getVendor, listVendorMembers, addVendorMember, removeVendorMember } from "@/modules/vendor/api";
import { listUserOptions } from "@/modules/user/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

async function addMemberAction(formData: FormData) {
    "use server";

    const vendorId = formData.get("vendorId") as string;
    const userId = formData.get("userId") as string;
    const role = (formData.get("role") as string) || "Manager";

    if (!vendorId || !userId) return;

    try {
        await addVendorMember(vendorId, userId, role);
    } catch (err: any) {
        console.error("[addMemberAction] error:", err);

        const msg =
            typeof err?.message === "string" && err.message.trim().length > 0
                ? err.message
                : "خطا در افزودن عضو جدید";

        redirect(
            `/admin/vendors/${vendorId}/members?error=${encodeURIComponent(msg)}`
        );
    }
    redirect(`/admin/vendors/${vendorId}/members`);
}

async function removeMemberAction(formData: FormData) {
    "use server";

    const vendorId = formData.get("vendorId") as string;
    const userId = formData.get("userId") as string;

    if (!vendorId || !userId) return;

    await removeVendorMember(vendorId, userId);
    revalidatePath(`/admin/vendors/${vendorId}/members`);
}

export default async function VendorMembersPage({
    params,
    searchParams,
}: {
    params: Promise<{ vendorId: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const [{ vendorId }, search] = await Promise.all([params, searchParams]);

    const errorMessage = search.error
        ? decodeURIComponent(search.error)
        : null;

    const [vendor, members, userOptions] = await Promise.all([
        getVendor(vendorId),
        listVendorMembers(vendorId),
        listUserOptions(),
    ]);

    return (
        <div className="space-y-4" dir="rtl">
            {/* نوار بالا */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-semibold text-slate-800">
                        مدیریت اعضای فروشنده «{vendor.storeName}»
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                        در این صفحه می‌توانید کاربران مختلف را به این فروشنده اضافه یا حذف کنید.
                    </p>
                </div>

                <Link
                    href="/admin/vendors"
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                    بازگشت به لیست فروشندگان
                </Link>
            </div>

            {/* نمایش پیام خطا در بالای صفحه (اگر وجود داشته باشد) */}
            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {errorMessage}
                </div>
            )}

            {/* فرم افزودن عضو جدید */}
            <form
                action={addMemberAction}
                className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
                <input type="hidden" name="vendorId" value={vendorId} />

                <div className="min-w-[220px] flex-1">
                    <label className="mb-1 block text-[11px] text-slate-600">کاربر</label>
                    <select
                        name="userId"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                        required
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
                        name="role"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="Manager"
                    >
                        <option value="Owner">مالک</option>
                        <option value="Manager">مدیر</option>
                        <option value="Staff">کاربر</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                        افزودن عضو
                    </button>
                </div>
            </form>

            {/* لیست اعضا */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {members.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                        هنوز عضوی برای این فروشنده ثبت نشده است.
                    </div>
                ) : (
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-3 py-2 font-medium text-slate-600">نام</th>
                                <th className="px-3 py-2 font-medium text-slate-600">ایمیل</th>
                                <th className="px-3 py-2 font-medium text-slate-600">نقش</th>
                                <th className="px-3 py-2 font-medium text-slate-600">وضعیت</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">
                                    عملیات
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m) => (
                                <tr key={m.userId} className="border-b border-slate-100">
                                    <td className="px-3 py-2">{m.fullName}</td>
                                    <td className="px-3 py-2 text-slate-500">{m.userEmail}</td>
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
                                        <form action={removeMemberAction}>
                                            <input type="hidden" name="vendorId" value={vendorId} />
                                            <input type="hidden" name="userId" value={m.userId} />
                                            <button
                                                type="submit"
                                                className="rounded-xl border border-red-100 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                                            >
                                                حذف
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
