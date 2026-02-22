export default function ApiInlineError({ error }: { error: any }) {
    const msg = String(error?.message || "خطا در ارتباط با سرور");
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="font-semibold mb-2">اتصال با مشکل مواجه شده است</div>
        </div>
    );
}
