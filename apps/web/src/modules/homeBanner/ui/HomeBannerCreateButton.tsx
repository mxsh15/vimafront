"use client";

import { PlusIcon } from "@heroicons/react/24/outline";

export function HomeBannerCreateButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
        >
            <PlusIcon className="h-4 w-4" />
            افزودن بنر
        </button>
    );
}
