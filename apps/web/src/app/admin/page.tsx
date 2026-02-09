"use client";

export default function AdminDashboardPage() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total Sales" value="$42,390" sub="This month" />
        <Stat title="Orders" value="1,284" sub="+3.1% vs last" />
        <Stat title="Customers" value="7,912" sub="Active" />
        <Stat title="Refunds" value="23" sub="-1.2% vs last" />
      </div>
      <div className="mt-8 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="mt-2 text-sm text-gray-600">
          Plug your charts here (Recharts, etc.).
        </p>
      </div>
    </>
  );
}

function Stat({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
