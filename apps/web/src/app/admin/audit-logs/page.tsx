import { AdminListPage } from "@/shared/components/AdminListPage";
import { listAdminAuditLogs } from "@/modules/admin-audit-logs/api";
import type { AdminAuditLogListItemDto } from "@/modules/admin-audit-logs/types";
import { AuditLogRowMenuCell } from "@/modules/admin-audit-logs/ui/AuditLogRowMenuCell";

export const metadata = { title: "Audit Logs | پنل مدیریت" };

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; status?: string; method?: string }>;
}) {
    const sp = await searchParams;
    const page = Number(sp?.page ?? 1);
    const q = sp?.q ?? "";
    const status = sp?.status ? Number(sp.status) : undefined;
    const method = sp?.method ?? undefined;

    const data = await listAdminAuditLogs({ page, pageSize: 20, q, status, method });

    return (
        <AdminListPage<AdminAuditLogListItemDto>
            title="Audit Logs"
            subtitle="ثبت رویدادهای مدیریتی (Non-GET) برای ردیابی تغییرات و خطاها"
            basePath="/admin/audit-logs"
            data={data}
            q={q}
            createButton={null as any}
            showTrashButton={false}
            searchPlaceholder="جستجو: path / email / action / entity..."
            rowMenuHeader="عملیات"
            rowMenuCell={(row) => <AuditLogRowMenuCell row={row} />}
            columns={[
                { id: "time", header: "زمان", cell: (r) => new Date(r.createdAtUtc).toLocaleString("fa-IR"), cellClassName: "px-2 text-[11px] text-slate-500" },
                { id: "user", header: "کاربر", cell: (r) => r.userEmail ?? "-", cellClassName: "px-2 text-xs font-mono" },
                { id: "method", header: "متد", cell: (r) => r.method, cellClassName: "px-2 text-xs" },
                { id: "path", header: "مسیر", cell: (r) => r.path, cellClassName: "px-2 text-xs" },
                { id: "status", header: "کد", cell: (r) => r.statusCode, cellClassName: "px-2 text-xs text-center" },
                { id: "ms", header: "مدت", cell: (r) => `${r.durationMs}ms`, cellClassName: "px-2 text-xs text-center" },
            ]}
        />
    );
}
