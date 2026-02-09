import { getReportsOverview } from "@/modules/admin-reports/api";

export const metadata = { title: "Reports | پنل مدیریت" };

export default async function Page() {
    const d = await getReportsOverview();

    return (
        <main className="flex-1 px-6 pb-6 pt-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-semibold text-slate-900">Reports Dashboard</h1>
                    <p className="mt-1 text-[11px] text-slate-400">نمای کلی از فعالیت‌های مدیریتی و خطاها</p>
                </div>
                <a href="/admin/audit-logs" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]">Audit Logs</a>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <Card title="Actions 24h" value={d.actions24h} />
                <Card title="Errors 24h" value={d.errors24h} />
                <Card title="Actions 7d" value={d.actions7d} />
                <Card title="Errors 7d" value={d.errors7d} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Panel title="Top Paths (24h)">
                    <MiniTable rows={d.topPaths24h} />
                </Panel>

                <Panel title="Top Users (24h)">
                    <MiniTable rows={d.topUsers24h} />
                </Panel>
            </div>
        </main>
    );
}

function Card({ title, value }: { title: string; value: number | undefined }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] text-slate-500">{title}</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{value.toLocaleString("fa-IR")}</div>
        </div>
    );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-3">{children}</div>
        </div>
    );
}

function MiniTable({ rows }: { rows: { key?: string | null; count?: number }[] | null | undefined }) {
  const safe = (rows ?? []).map((r) => ({ key: String(r.key ?? ""), count: Number(r.count ?? 0) })).filter((r) => r.key);
    if (!safe.length) return <div className="text-xs text-slate-500">موردی وجود ندارد.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <tbody>
                    {safe.map((r) => (
                        <tr key={r.key} className="border-t">
                            <td className="px-2 py-2 font-mono text-[11px] text-slate-700">{r.key}</td>
                            <td className="px-2 py-2 text-right text-slate-700">{r.count.toLocaleString("fa-IR")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
