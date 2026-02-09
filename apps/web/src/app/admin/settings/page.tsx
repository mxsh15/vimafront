import { getSettings } from "@/modules/settings/api";
import AdminSettingsForm from "@/modules/settings/ui/AdminSettingsForm";

export const metadata = {
    title: "تنظیمات سایت | پنل مدیریت",
};

export default async function Page() {
    const settings = await getSettings();

    const safeSettings = {
        ...settings,
        logoUrl: settings.logoUrl ?? "",
        timeZoneId: settings.timeZoneId ?? "Asia/Tehran",
        dateFormat: settings.dateFormat ?? "",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-sm font-semibold text-slate-800">تنظیمات سایت</h1>
                <p className="text-xs text-slate-500">
                    تنظیمات عمومی، شبکه‌های اجتماعی، SEO و زمان‌بندی
                </p>
            </div>

            <AdminSettingsForm settings={safeSettings} />
        </div>
    );
}
