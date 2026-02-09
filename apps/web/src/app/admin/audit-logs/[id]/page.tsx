import { getAdminAuditLog } from "@/modules/admin-audit-logs/api";

export const metadata = { title: "Audit Log Detail | پنل مدیریت" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const x = await getAdminAuditLog(id);

    return (
        <main className="flex-1 px-6 pb-6 pt-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-semibold text-slate-900">جزئیات Audit</h1>
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(x.createdAtUtc).toLocaleString("fa-IR")}</p>
                </div>
                <a href="/admin/audit-logs" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]">← برگشت</a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                <div><b>User:</b> <span className="font-mono">{x.userEmail ?? "-"}</span></div>
                <div><b>Method:</b> {x.method}</div>
                <div><b>Path:</b> <span className="font-mono">{x.path}</span></div>
                <div><b>Query:</b> <span className="font-mono">{x.queryString ?? "-"}</span></div>
                <div><b>Status:</b> {x.statusCode}</div>
                <div><b>Duration:</b> {x.durationMs}ms</div>
                <div><b>IP:</b> <span className="font-mono">{x.ipAddress ?? "-"}</span></div>
                <div><b>UserAgent:</b> <span className="font-mono break-all">{x.userAgent ?? "-"}</span></div>
                <div><b>Entity:</b> {x.entityType ?? "-"} {x.entityId ? `(${x.entityId})` : ""}</div>
                <div><b>Action:</b> {x.action ?? "-"}</div>
                <div><b>Notes:</b> {x.notes ?? "-"}</div>
            </div>
        </main>
    );
}
