import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminNotifications } from "@/modules/admin-notifications/api";
import type { AdminNotificationListItemDto } from "@/modules/admin-notifications/types";
import { NotificationRowMenuCell } from "@/modules/admin-notifications/ui/NotificationRowMenuCell";
import { SendNotificationModalButton } from "@/modules/admin-notifications/ui/SendNotificationModalButton";

import { listUserOptions } from "@/modules/user/api";
import { listRoleOptions } from "@/modules/role/api";
import { listVendorOptions } from "@/modules/vendor/api";

export const metadata = { title: "اعلان‌ها | پنل مدیریت" };

function typeLabel(t: number) {
    return ["سفارش", "پرداخت", "ارسال", "محصول", "سیستمی", "فروشنده"][t] ?? "سیستمی";
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; type?: string; isRead?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";

    const type = sp?.type ? Number(sp.type) : undefined;
    const isRead =
        sp?.isRead === "true" ? true : sp?.isRead === "false" ? false : undefined;

    const data = await listAdminNotifications({ page, pageSize: 20, q, type: type as any, isRead });

    // برای Modal ارسال اعلان
    const userOptions = await listUserOptions();
    const roleOptions = await listRoleOptions();
    const vendorOptions = await listVendorOptions();

    return (
        <AdminListPage<AdminNotificationListItemDto>
            title="اعلان‌ها"
            subtitle="مدیریت اعلان‌های کاربران + ارسال اعلان دستی"
            basePath="/admin/notifications"
            data={data}
            q={q}
            createButton={
                <SendNotificationModalButton
                    userOptions={userOptions}
                    roleOptions={roleOptions}
                    vendorOptions={vendorOptions}
                />
            }
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <NotificationRowMenuCell row={row} />}
            searchPlaceholder="جستجو: عنوان / متن / ایمیل / نام..."
            columns={[
                { id: "title", header: "عنوان", cell: (r) => r.title, cellClassName: "px-2 text-xs" },
                { id: "user", header: "کاربر", cell: (r) => `${r.userFullName} (${r.userEmail})`, cellClassName: "px-2 text-xs" },
                { id: "type", header: "نوع", cell: (r) => typeLabel(r.type), cellClassName: "px-2 text-xs" },
                { id: "read", header: "وضعیت", cell: (r) => (r.isRead ? "خوانده" : "خوانده نشده"), cellClassName: "px-2 text-xs" },
                { id: "createdAt", header: "تاریخ", cell: (r) => new Date(r.createdAtUtc).toLocaleString("fa-IR"), cellClassName: "px-2 text-xs" },
            ]}
        />
    );
}
