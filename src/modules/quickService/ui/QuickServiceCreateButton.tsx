"use client";

export function QuickServiceCreateButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-slate-800"
        >
            افزودن آیتم
        </button>
    );
}
