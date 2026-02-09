"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AttributeGroupListItemDto,
    AttributeOptionDto,
    AttributeValueType,
    ProductAttributeListItemDto,
    ProductSpecItemDto,
    ProductSpecItemUpsertDto,
    UpsertProductSpecsRequest,
} from "../types";
import { createAttributeOption, listAttributeOptionsByAttribute, upsertProductSpecs } from "../client-api";
import MultiOptionCell from "./MultiOptionCell";

type Props = {
    productId?: string;
    initialSpecs: ProductSpecItemDto[];
    allAttributes: ProductAttributeListItemDto[];
    groups: AttributeGroupListItemDto[];
    disabled?: boolean;
};

type LocalRow = {
    id?: string | null;
    attributeId: string;
    attributeName: string;
    valueType: AttributeValueType;
    attributeGroupId?: string | null;
    optionId?: string | null;
    selectedOptionIds?: string[];
    rawValue?: string | null;
    numericValue?: number | null;
    boolValue?: boolean | null;
    dateTimeValue?: string | null;
    displayOrder: number;
};

export function ProductSpecsEditor({
    productId,
    initialSpecs,
    allAttributes,
    groups,
    disabled,
}: Props) {
    const [rows, setRows] = useState<LocalRow[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [optionsByAttribute, setOptionsByAttribute] = useState<
        Record<string, AttributeOptionDto[]>
    >({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [creatingOptionFor, setCreatingOptionFor] = useState<string | null>(null);


    // Map attributeId -> attribute
    const attributesMap = useMemo(
        () =>
            Object.fromEntries(allAttributes.map((a) => [a.id, a] as const)),
        [allAttributes]
    );

    useEffect(() => {
        // ۱) گروه‌بندی بر اساس attributeId
        const byAttr = new Map<string, LocalRow>();

        initialSpecs.forEach((s, idx) => {
            const key = s.attributeId;

            if (s.valueType === AttributeValueType.MultiOption && s.optionId) {
                // اگر قبلاً برای این Attribute سطر داریم، فقط option جدید را اضافه کن
                const existing = byAttr.get(key);
                if (existing) {
                    existing.selectedOptionIds = [
                        ...(existing.selectedOptionIds ?? []),
                        s.optionId,
                    ];
                    return;
                }

                // سطر جدید برای MultiOption
                byAttr.set(key, {
                    id: null, // Idها را نگه نمی‌داریم، چون قرار است دوباره ساخته شوند
                    attributeId: s.attributeId,
                    attributeName: s.attributeName,
                    valueType: s.valueType,
                    attributeGroupId: s.attributeGroupId ?? null,
                    selectedOptionIds: [s.optionId],
                    displayOrder: s.displayOrder ?? idx,
                });

                return;
            }

            // سایر انواع (Option/Number/...) مثل قبل
            const row: LocalRow = {
                id: s.id,
                attributeId: s.attributeId,
                attributeName: s.attributeName,
                valueType: s.valueType,
                attributeGroupId: s.attributeGroupId ?? null,
                optionId: s.optionId ?? null,
                rawValue: s.rawValue ?? null,
                numericValue: s.numericValue ?? null,
                boolValue: s.boolValue ?? null,
                dateTimeValue: s.dateTimeValue ?? null,
                displayOrder: s.displayOrder ?? idx,
            };

            // اگر به هر دلیلی قبلاً چیزی با این attributeId بود، overwrite می‌کنیم
            byAttr.set(key, row);
        });

        const mapped = Array.from(byAttr.values()).sort(
            (a, b) => a.displayOrder - b.displayOrder
        );

        setRows(mapped);

        // بقیه‌ی کد لود کردن options (تقریباً مثل قبل)
        const optionRows = mapped.filter(
            (r) =>
            (r.valueType === AttributeValueType.Option ||
                r.valueType === AttributeValueType.MultiOption)
        );

        if (optionRows.length === 0) return;

        const uniqueAttributeIds = Array.from(
            new Set(optionRows.map((r) => r.attributeId))
        );

        (async () => {
            setLoadingOptions(true);
            try {
                const entries = await Promise.all(
                    uniqueAttributeIds.map(async (attrId) => {
                        const opts = await listAttributeOptionsByAttribute(attrId);
                        return [attrId, opts] as const;
                    })
                );

                setOptionsByAttribute((prev) => {
                    const next = { ...prev };
                    for (const [attrId, opts] of entries) {
                        next[attrId] = opts;
                    }
                    return next;
                });
            } finally {
                setLoadingOptions(false);
            }
        })();
    }, [initialSpecs]);


    // اضافه کردن ویژگی تکی
    const handleAddAttribute = (attributeId: string) => {
        if (!attributeId) return;

        const attr = attributesMap[attributeId];
        if (!attr) return;

        // فقط برای ویژگی‌های غیر MultiOption جلوی تکرار را بگیر
        if (attr.valueType !== AttributeValueType.MultiOption) {
            const exists = rows.some((r) => r.attributeId === attributeId);
            if (exists) return;
        }

        const newRow: LocalRow = {
            id: null,
            attributeId,
            attributeName: attr.name,
            valueType: attr.valueType,
            attributeGroupId: attr.attributeGroupId ?? null,
            displayOrder: rows.length,
        };

        setRows((prev) => [...prev, newRow]);
    };


    // اضافه کردن کل یک گروه ویژگی
    const handleAddGroup = (groupId: string) => {
        if (!groupId) return;
        const group = groups.find((g) => g.id === groupId);
        if (!group) return;

        const newRows: LocalRow[] = [];

        for (const attrId of group.attributeIds) {
            const attr = attributesMap[attrId];
            if (!attr) continue;

            // فقط برای ویژگی‌های غیر MultiOption از تکرار جلوگیری کن
            if (
                attr.valueType !== AttributeValueType.MultiOption &&
                rows.some((r) => r.attributeId === attr.id)
            ) {
                continue;
            }

            newRows.push({
                id: null,
                attributeId: attr.id,
                attributeName: attr.name,
                valueType: attr.valueType,
                attributeGroupId: group.id,
                displayOrder: rows.length + newRows.length,
            });
        }

        if (newRows.length > 0) {
            setRows((prev) => [...prev, ...newRows]);
        }
    };

    const handleRemoveRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeRow = (index: number, patch: Partial<LocalRow>) => {
        setRows((prev) =>
            prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
        );
    };

    // لود گزینه‌ها برای یک Attribute (گزینه‌ای / چندگزینه‌ای)
    const ensureOptionsLoaded = async (attributeId: string) => {
        if (optionsByAttribute[attributeId]) return;
        setLoadingOptions(true);
        try {
            const opts = await listAttributeOptionsByAttribute(attributeId);
            setOptionsByAttribute((prev) => ({ ...prev, [attributeId]: opts }));
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleCreateOptionForRow = async (rowIndex: number) => {
        const row = rows[rowIndex];
        if (!row) return;
        if (!row.attributeId) return;
        if (!row.rawValue || !row.rawValue.trim()) return;

        const attributeId = row.attributeId;
        const value = row.rawValue.trim();
        const existingOpts = optionsByAttribute[attributeId] ?? [];
        const already = existingOpts.find(
            (o) =>
                (o.displayLabel || o.value).trim().toLowerCase() ===
                value.toLowerCase()
        );
        if (already) {
            if (row.valueType === AttributeValueType.MultiOption) {
                handleChangeRow(rowIndex, {
                    selectedOptionIds: [
                        ...(row.selectedOptionIds ?? []),
                        already.id,
                    ],
                    rawValue: "",
                });
            } else {
                handleChangeRow(rowIndex, {
                    optionId: already.id,
                    rawValue: already.displayLabel || already.value,
                });
            }
            return;
        }

        try {
            setCreatingOptionFor(attributeId);
            const newOption = await createAttributeOption(attributeId, value);

            setOptionsByAttribute((prev) => ({
                ...prev,
                [attributeId]: [...(prev[attributeId] ?? []), newOption],
            }));

            if (row.valueType === AttributeValueType.MultiOption) {
                handleChangeRow(rowIndex, {
                    selectedOptionIds: [
                        ...(row.selectedOptionIds ?? []),
                        newOption.id,
                    ],
                    rawValue: "",
                });
            } else {
                handleChangeRow(rowIndex, {
                    optionId: newOption.id,
                    rawValue: newOption.displayLabel || newOption.value,
                });
            }
        } catch (e: any) {
            setError(e?.message || "خطا در افزودن گزینه جدید برای این ویژگی.");
        } finally {
            setCreatingOptionFor(null);
        }
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        if (!productId) {
            setError("برای ذخیره مشخصات، ابتدا محصول باید ساخته شده باشد.");
            return;
        }

        const items: ProductSpecItemUpsertDto[] = [];

        rows.forEach((r, idx) => {
            if (
                r.valueType === AttributeValueType.MultiOption
            ) {
                const selectedIds = r.selectedOptionIds ?? [];
                if (selectedIds.length === 0) return;

                selectedIds.forEach((optId, j) => {
                    items.push({
                        id: null, // همه را جدید می‌سازیم
                        attributeId: r.attributeId,
                        attributeGroupId: r.attributeGroupId ?? null,
                        valueType: r.valueType,
                        optionId: optId,
                        rawValue: null,
                        numericValue: null,
                        boolValue: null,
                        dateTimeValue: null,
                        displayOrder: idx * 100 + j, // فقط یک ترتیب تقریبی
                    });
                });

                return;
            }

            // بقیه انواع مثل قبل
            let fixedRow = { ...r };

            if (
                (r.valueType === AttributeValueType.Option) &&
                r.optionId
            ) {
                const opts = optionsByAttribute[r.attributeId] ?? [];
                const selectedOption =
                    opts.find((o) => o.id === r.optionId) || null;

                fixedRow = {
                    ...r,
                    rawValue:
                        selectedOption?.displayLabel ??
                        selectedOption?.value ??
                        r.rawValue ??
                        null,
                };
            }

            items.push({
                id: fixedRow.id ?? null,
                attributeId: fixedRow.attributeId,
                attributeGroupId: fixedRow.attributeGroupId ?? null,
                valueType: fixedRow.valueType,
                optionId: fixedRow.optionId ?? null,
                rawValue: fixedRow.rawValue ?? null,
                numericValue: fixedRow.numericValue ?? null,
                boolValue: fixedRow.boolValue ?? null,
                dateTimeValue: fixedRow.dateTimeValue ?? null,
                displayOrder: idx,
            });
        });

        const payload: UpsertProductSpecsRequest = {
            productId,
            items,
        };

        setSaving(true);
        try {
            await upsertProductSpecs(productId, payload);
            setSuccess("مشخصات با موفقیت ذخیره شد.");
        } catch (e: any) {
            setError(e?.message || "خطا در ذخیره مشخصات.");
        } finally {
            setSaving(false);
        }
    };


    return (
        <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-md font-semibold text-gray-800 text-right">
                    مشخصات فنی محصول
                </h4>

                <div className="flex flex-wrap gap-2 text-xs">
                    {/* افزودن ویژگی تکی */}
                    <select
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 bg-white"
                        defaultValue=""
                        onChange={(e) => {
                            handleAddAttribute(e.target.value);
                            e.target.value = "";
                        }}
                        disabled={disabled}
                    >
                        <option value="">افزودن ویژگی تکی...</option>
                        {allAttributes.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} ({a.key})
                            </option>
                        ))}
                    </select>

                    {/* افزودن کل یک گروه */}
                    <select
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 bg-white"
                        defaultValue=""
                        onChange={(e) => {
                            handleAddGroup(e.target.value);
                            e.target.value = "";
                        }}
                        disabled={disabled}
                    >
                        <option value="">افزودن از گروه ویژگی...</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.attributeSetName} / {g.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* جدول مشخصات */}
            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-100">
                        <tr className="text-right">
                            <th className="px-2 py-2 font-medium text-gray-700">ویژگی</th>
                            <th className="px-2 py-2 font-medium text-gray-700">مقدار</th>
                            <th className="px-2 py-2 font-medium text-gray-700">واحد</th>
                            <th className="px-2 py-2 font-medium text-gray-700">ترتیب</th>
                            <th className="px-2 py-2 font-medium text-gray-700">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-3 py-4 text-center text-xs text-gray-400"
                                >
                                    هنوز هیچ مشخصه‌ای ثبت نشده است.
                                </td>
                            </tr>
                        )}

                        {rows.map((row, index) => {
                            const attr = attributesMap[row.attributeId];
                            const unit = attr?.unit ?? "";

                            const isOptionType =
                                row.valueType === AttributeValueType.Option ||
                                row.valueType === AttributeValueType.MultiOption;

                            const opts = isOptionType
                                ? optionsByAttribute[row.attributeId] ?? []
                                : [];

                            return (
                                <tr key={index} className="text-right align-middle">
                                    {/* نام ویژگی */}
                                    <td className="px-2 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">
                                                {row.attributeName}
                                            </span>
                                            {attr && (
                                                <span className="font-mono text-[10px] text-gray-400">
                                                    {attr.key}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* مقدار */}
                                    <td className="px-2 py-2">
                                        {(() => {
                                            switch (row.valueType) {
                                                case AttributeValueType.Number:
                                                    return (
                                                        <input
                                                            type="number"
                                                            className="w-40 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800"
                                                            value={row.numericValue ?? ""}
                                                            onChange={(e) =>
                                                                handleChangeRow(index, {
                                                                    numericValue:
                                                                        e.target.value === ""
                                                                            ? null
                                                                            : Number(e.target.value),
                                                                    rawValue: e.target.value || null,
                                                                })
                                                            }
                                                            disabled={disabled}
                                                        />
                                                    );

                                                case AttributeValueType.Boolean:
                                                    return (
                                                        <label className="inline-flex items-center gap-1 text-xs text-gray-700">
                                                            <input
                                                                type="checkbox"
                                                                checked={row.boolValue ?? false}
                                                                onChange={(e) =>
                                                                    handleChangeRow(index, {
                                                                        boolValue: e.target.checked,
                                                                        rawValue: e.target.checked ? "بله" : "خیر",
                                                                    })
                                                                }
                                                                disabled={disabled}
                                                            />
                                                            <span>بله / خیر</span>
                                                        </label>
                                                    );

                                                case AttributeValueType.DateTime:
                                                    return (
                                                        <input
                                                            type="date"
                                                            className="w-40 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800"
                                                            value={
                                                                row.dateTimeValue
                                                                    ? row.dateTimeValue.slice(0, 10)
                                                                    : ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChangeRow(index, {
                                                                    dateTimeValue: e.target.value
                                                                        ? new Date(e.target.value)
                                                                            .toISOString()
                                                                            .slice(0, 10)
                                                                        : null,
                                                                    rawValue: e.target.value || null,
                                                                })
                                                            }
                                                            disabled={disabled}
                                                        />
                                                    );

                                                case AttributeValueType.Option:
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                className="w-48 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800 bg-white"
                                                                value={row.optionId ?? ""}
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value || null;
                                                                    const opts = optionsByAttribute[row.attributeId] ?? [];
                                                                    const selectedOption =
                                                                        opts.find((o) => o.id === selectedId) || null;

                                                                    handleChangeRow(index, {
                                                                        optionId: selectedId,
                                                                        rawValue:
                                                                            selectedOption?.displayLabel ??
                                                                            selectedOption?.value ??
                                                                            null,
                                                                    });
                                                                }}
                                                                onFocus={() => ensureOptionsLoaded(row.attributeId)}
                                                                disabled={disabled}
                                                            >
                                                                <option value="">انتخاب از لیست...</option>
                                                                {opts.map((o) => (
                                                                    <option key={o.id} value={o.id}>
                                                                        {o.displayLabel || o.value}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* ورودی و دکمه افزودن به لیست برای حالت Option تکی */}
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="w-64 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800"
                                                                    value={row.rawValue ?? ""}
                                                                    onChange={(e) =>
                                                                        handleChangeRow(index, { rawValue: e.target.value || null })
                                                                    }
                                                                    disabled={disabled}
                                                                    placeholder="یا مقدار دلخواه را بنویسید..."
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCreateOptionForRow(index)}
                                                                    disabled={
                                                                        disabled ||
                                                                        !row.rawValue?.trim() ||
                                                                        creatingOptionFor === row.attributeId
                                                                    }
                                                                    className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                                                                >
                                                                    {creatingOptionFor === row.attributeId
                                                                        ? "در حال افزودن..."
                                                                        : "افزودن به لیست"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );

                                                case AttributeValueType.MultiOption:
                                                    return (
                                                        <MultiOptionCell
                                                            attributeId={row.attributeId}
                                                            options={opts}
                                                            selectedIds={row.selectedOptionIds ?? []}
                                                            disabled={disabled}
                                                            loading={loadingOptions && creatingOptionFor === row.attributeId}
                                                            onChange={(ids) =>
                                                                handleChangeRow(index, { selectedOptionIds: ids })
                                                            }
                                                            onCreateOption={async (label) => {
                                                                // ایجاد مقدار جدید روی API و آپدیت استور لوکال
                                                                const newOption = await createAttributeOption(
                                                                    row.attributeId,
                                                                    label
                                                                );
                                                                setOptionsByAttribute((prev) => ({
                                                                    ...prev,
                                                                    [row.attributeId]: [...(prev[row.attributeId] ?? []), newOption],
                                                                }));
                                                                return newOption;
                                                            }}
                                                        />
                                                    );
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            {/* شبیه ووکامرس: چند مقدار داخل یک باکس */}
                                                            <select
                                                                multiple
                                                                className="w-80 h-24 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800 bg-white"
                                                                value={row.selectedOptionIds ?? []}
                                                                onChange={(e) => {
                                                                    const selected = Array.from(
                                                                        e.target.selectedOptions
                                                                    ).map((o) => o.value);
                                                                    handleChangeRow(index, {
                                                                        selectedOptionIds: selected,
                                                                    });
                                                                }}
                                                                onFocus={() => ensureOptionsLoaded(row.attributeId)}
                                                                disabled={disabled}
                                                            >
                                                                {opts.map((o) => (
                                                                    <option key={o.id} value={o.id}>
                                                                        {o.displayLabel || o.value}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {loadingOptions && (
                                                                <span className="text-[10px] text-gray-400">
                                                                    در حال بارگذاری گزینه‌ها...
                                                                </span>
                                                            )}

                                                            {/* نمایش تگ‌ها شبیه چیپ‌های ووکامرس (آپشنال ولی شبیه همون تصویر میشه) */}
                                                            <div className="flex flex-wrap gap-1">
                                                                {(row.selectedOptionIds ?? [])
                                                                    .map((id) => opts.find((o) => o.id === id))
                                                                    .filter(Boolean)
                                                                    .map((o) => (
                                                                        <span
                                                                            key={o!.id}
                                                                            className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[11px]"
                                                                        >
                                                                            {o!.displayLabel || o!.value}
                                                                            <button
                                                                                type="button"
                                                                                className="ml-1 text-gray-500 hover:text-red-500"
                                                                                onClick={() => {
                                                                                    handleChangeRow(index, {
                                                                                        selectedOptionIds: (row.selectedOptionIds ?? []).filter(
                                                                                            (x) => x !== o!.id
                                                                                        ),
                                                                                    });
                                                                                }}
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                            </div>

                                                            {/* ورودی برای ساخت مقدار جدید و اضافه‌کردنش */}
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="w-64 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800"
                                                                    value={row.rawValue ?? ""}
                                                                    onChange={(e) =>
                                                                        handleChangeRow(index, { rawValue: e.target.value || null })
                                                                    }
                                                                    disabled={disabled}
                                                                    placeholder="نوشتن مقدار جدید و افزودن..."
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCreateOptionForRow(index)}
                                                                    disabled={
                                                                        disabled ||
                                                                        !row.rawValue?.trim() ||
                                                                        creatingOptionFor === row.attributeId
                                                                    }
                                                                    className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                                                                >
                                                                    {creatingOptionFor === row.attributeId
                                                                        ? "در حال افزودن..."
                                                                        : "ایجاد و انتخاب"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                case AttributeValueType.Text:
                                                default:
                                                    return (
                                                        <input
                                                            type="text"
                                                            className="w-64 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-800"
                                                            value={row.rawValue ?? ""}
                                                            onChange={(e) =>
                                                                handleChangeRow(index, {
                                                                    rawValue: e.target.value || null,
                                                                })
                                                            }
                                                            disabled={disabled}
                                                            placeholder="مثال: 256 گیگابایت"
                                                        />
                                                    );
                                            }
                                        })()}
                                    </td>

                                    {/* واحد */}
                                    <td className="px-2 py-2">
                                        <span className="text-[11px] text-gray-500">{unit}</span>
                                    </td>

                                    {/* ترتیب نمایش */}
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className="w-16 rounded-md border border-gray-300 px-2 py-1 text-[11px] text-gray-800"
                                            value={row.displayOrder}
                                            onChange={(e) =>
                                                handleChangeRow(index, {
                                                    displayOrder: Number(e.target.value || 0),
                                                })
                                            }
                                            disabled={disabled}
                                        />
                                    </td>

                                    {/* حذف */}
                                    <td className="px-2 py-2">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
                                            onClick={() => handleRemoveRow(index)}
                                            disabled={disabled}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* وضعیت ذخیره / خطا */}
            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs">
                    {error && <p className="text-red-600">{error}</p>}
                    {success && <p className="text-green-600">{success}</p>}
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={disabled || saving || !productId}
                    className="inline-flex items-center rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-60"
                >
                    {saving ? "در حال ذخیره مشخصات..." : "ذخیره مشخصات فنی"}
                </button>
            </div>
        </section>
    );
}
