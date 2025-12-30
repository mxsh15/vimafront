import Link from "next/link";
import type { PublicStoreSettingsDto } from "@/modules/settings/public-types";

type Props = { settings: PublicStoreSettingsDto };

export default function PublicFooter({ settings }: Props) {
    const socials = [
        { label: "اینستاگرام", url: settings.instagramUrl },
        { label: "تلگرام", url: settings.telegramUrl },
        { label: "واتساپ", url: settings.whatsappUrl },
    ].filter(x => !!x.url);

    return (
        <footer className="mt-10 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {settings.storeName}
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            {settings.supportEmail ? <div>ایمیل: {settings.supportEmail}</div> : null}
                            {settings.supportPhone ? <div>تلفن: {settings.supportPhone}</div> : null}
                        </div>
                    </div>

                    {socials.length ? (
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">شبکه‌های اجتماعی</div>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {socials.map(s => (
                                    <a
                                        key={s.label}
                                        href={s.url!}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        {s.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="mt-6 text-[11px] text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} {settings.storeName}
                </div>
            </div>
        </footer>
    );
}
