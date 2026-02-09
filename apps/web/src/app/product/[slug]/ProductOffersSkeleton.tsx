export default function ProductOffersSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="rounded-xl border border-slate-200 p-3 space-y-2">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="h-3 w-28 rounded bg-slate-200" />
      </div>
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      <div className="h-10 w-full rounded-xl bg-slate-200" />
    </div>
  );
}
