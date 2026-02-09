import { useState, useMemo } from "react";
import { MultiOptionCellProps, AttributeOptionDto } from "../types";

export default function MultiOptionCell({
    attributeId,
    options,
    selectedIds,
    disabled,
    loading,
    onChange,
    onCreateOption,
}: MultiOptionCellProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedOptions = useMemo(
        () => selectedIds.map((id) => options.find((o) => o.id === id)).filter(Boolean) as AttributeOptionDto[],
        [selectedIds, options]
    );

    const filteredOptions = useMemo(
        () =>
            options.filter((o) => {
                if (!search.trim()) return true;
                const label = (o.displayLabel || o.value || "").toLowerCase();
                return label.includes(search.trim().toLowerCase());
            }),
        [options, search]
    );

    const toggleId = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((x) => x !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        onChange(options.map((o) => o.id));
    };

    const handleSelectNone = () => {
        onChange([]);
    };

    const handleCreate = async () => {
        const label = window.prompt("یک نام برای ویژگی جدید وارد کنید:")?.trim();
        if (!label) return;
        const newOpt = await onCreateOption(label);
        onChange([...selectedIds, newOpt.id]);
        setOpen(true);
    };

    return (
        <div className="relative w-full max-w-xl text-xs text-gray-800">
            {/* باکس اصلی مثل ووکامرس */}
            <div
                className={`min-h-[42px] w-full cursor-pointer rounded-md border px-2 py-1 flex flex-wrap items-center gap-1 bg-white ${disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"
                    }`}
                onClick={() => !disabled && setOpen((o) => !o)}
            >
                {selectedOptions.length === 0 && (
                    <span className="text-[11px] text-gray-400">
                        یک یا چند مقدار انتخاب کنید...
                    </span>
                )}

                {selectedOptions.map((o) => (
                    <span
                        key={o.id}
                        className="inline-flex items-center rounded-full bg-gray-100 border border-gray-300 px-2 py-0.5 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {o.displayLabel || o.value}
                        {!disabled && (
                            <button
                                type="button"
                                className="ml-1 text-gray-500 hover:text-red-500"
                                onClick={() => toggleId(o.id)}
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}
            </div>

            {/* پنل دراپ‌داون شبیه select2 ووکامرس */}
            {open && !disabled && (
                <div className="absolute z-30 mt-1 w-full max-h-56 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    <div className="border-b border-gray-200 px-2 py-1">
                        <input
                            type="text"
                            className="w-full rounded border border-gray-200 px-2 py-1 text-[11px]"
                            placeholder="فیلتر مقادیر..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="max-h-40 overflow-auto py-1">
                        {filteredOptions.map((o) => (
                            <label
                                key={o.id}
                                className="flex items-center gap-2 px-2 py-1 text-[11px] hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="h-3 w-3"
                                    checked={selectedIds.includes(o.id)}
                                    onChange={() => toggleId(o.id)}
                                />
                                <span>{o.displayLabel || o.value}</span>
                            </label>
                        ))}

                        {filteredOptions.length === 0 && (
                            <div className="px-2 py-2 text-[11px] text-gray-400">
                                مقداری با این فیلتر پیدا نشد.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* دکمه‌ها مثل ووکامرس: ایجاد مقدار / انتخاب همه / هیچکدام */}
            <div className="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={disabled || loading}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                    ایجاد مقدار
                </button>
                <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={disabled || options.length === 0}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                    انتخاب همه
                </button>
                <button
                    type="button"
                    onClick={handleSelectNone}
                    disabled={disabled || selectedIds.length === 0}
                    className="rounded border border-gray-300 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                    انتخاب هیچکدام
                </button>
            </div>

            {loading && (
                <div className="mt-1 text-[10px] text-gray-400">
                    در حال بارگذاری گزینه‌ها...
                </div>
            )}
        </div>
    );
}
