import {
  getAdminVendorOffer,
  listAdminVendorOfferModerationLogs,
} from "@/modules/admin-vendor-offers/api";
import { OfferDetailActions } from "@/modules/admin-vendor-offers/ui/OfferDetailActions";

export const metadata = { title: "جزئیات پیشنهاد فروشنده | پنل مدیریت" };

function faDateTime(iso?: string | null) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("fa-IR");
  } catch {
    return "-";
  }
}

function statusFa(status: any) {
  const s = typeof status === "number" ? status : String(status);
  switch (s) {
    case 0:
    case "0":
    case "Pending":
      return "Pending";
    case 1:
    case "1":
    case "Approved":
      return "Approved";
    case 2:
    case "2":
    case "Rejected":
      return "Rejected";
    case 3:
    case "3":
    case "Disabled":
      return "Disabled";
    default:
      return String(status);
  }
}

function actionFa(action: any) {
  const a = typeof action === "number" ? action : String(action);
  switch (a) {
    case 1:
    case "1":
    case "Approve":
      return "تایید";
    case 2:
    case "2":
    case "Reject":
      return "رد";
    case 3:
    case "3":
    case "Disable":
      return "غیرفعال";
    case 4:
    case "4":
    case "Enable":
      return "بازگشت به Pending";
    case 5:
    case "5":
    case "SoftDelete":
      return "حذف";
    case 6:
    case "6":
    case "Restore":
      return "بازیابی";
    case 7:
    case "7":
    case "HardDelete":
      return "حذف دائمی";
    default:
      return String(action);
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [offer, logs] = await Promise.all([
    getAdminVendorOffer(id),
    listAdminVendorOfferModerationLogs(id),
  ]);

  const effectivePrice = Number(offer.discountPrice ?? offer.price);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">جزئیات پیشنهاد</div>
            <div className="mt-2 text-xs text-slate-700 space-y-1">
              <div>
                محصول: <span className="font-medium">{offer.productTitle}</span>
              </div>
              <div>
                فروشنده: <span className="font-medium">{offer.vendorName}</span>
              </div>
              <div>
                وضعیت: <span className="font-medium">{statusFa((offer as any).status)}</span>
                {offer.isDeleted ? (
                  <span className="mr-2 rounded-lg bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                    حذف شده
                  </span>
                ) : null}
              </div>
              <div>
                قیمت: {Number(offer.price).toLocaleString("fa-IR")} تومان
                {offer.discountPrice ? (
                  <span className="mr-2 text-slate-500">
                    | قیمت نهایی: {effectivePrice.toLocaleString("fa-IR")} تومان
                  </span>
                ) : null}
              </div>
              <div>
                موجودی: {offer.manageStock ? offer.stockQuantity : "کنترل نمی‌شود"}
              </div>
              <div>CreatedAt: {faDateTime(offer.createdAtUtc)}</div>
              <div>UpdatedAt: {faDateTime(offer.updatedAtUtc)}</div>
              <div>DeletedAt: {faDateTime(offer.deletedAtUtc)}</div>
              <div className="pt-1">
                OfferId: <span className="font-mono">{offer.id}</span>
              </div>
              <div>
                ProductId: <span className="font-mono">{offer.productId}</span>
              </div>
              <div>
                VendorId: <span className="font-mono">{offer.vendorId}</span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href="/admin/vendor-offers"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
              >
                ← برگشت
              </a>
              <a
                href={`/admin/products/${offer.productId}`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
              >
                ویرایش محصول
              </a>
              <a
                href={`/admin/vendors/${offer.vendorId}/members`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
              >
                اعضای فروشنده
              </a>
            </div>
          </div>

          <div className="min-w-[280px]">
            <OfferDetailActions offerId={offer.id} current={offer} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold">تاریخچه بررسی (Moderation Logs)</div>

        {logs.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-right text-slate-500">
                  <th className="py-2">زمان</th>
                  <th className="py-2">اکشن</th>
                  <th className="py-2">ادمین</th>
                  <th className="py-2">یادداشت</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100">
                    <td className="py-2 whitespace-nowrap">
                      {faDateTime(l.createdAtUtc)}
                    </td>
                    <td className="py-2 whitespace-nowrap font-medium">
                      {actionFa(l.action)}
                    </td>
                    <td className="py-2">
                      <div className="space-y-0.5">
                        <div>{l.adminFullName ?? "-"}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {l.adminEmail ?? l.adminUserId}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 break-words min-w-[240px]">
                      {l.notes ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-500">
            هنوز لاگی برای این پیشنهاد ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
}
