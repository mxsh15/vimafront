"use client";

import { FormEvent, useState, useTransition } from "react";
import type { BrandUpsertInput } from "../schemas";
import type { BrandDetailDto } from "../types";

type Props = {
  submitLabel: string;
  defaultValues?: Partial<BrandDetailDto> | null;
  onSubmit: (data: BrandUpsertInput) => Promise<void>;
};

export function BrandForm({ submitLabel, defaultValues, onSubmit }: Props) {
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState<string>(String(defaultValues?.title ?? ""));
  const [slug, setSlug] = useState<string>(String(defaultValues?.slug ?? ""));
  const [logoUrl, setLogoUrl] = useState<string>(String(defaultValues?.logoUrl ?? ""));
  const [isActive, setIsActive] = useState<boolean>(Boolean(defaultValues?.isActive ?? true));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const dto: BrandUpsertInput = {
      id: (defaultValues as any)?.id,
      rowVersion: (defaultValues as any)?.rowVersion ?? null,
      title: title.trim(),
      slug: slug.trim(),
      logoUrl: logoUrl.trim() || null,
      isActive,
    };

    startTransition(async () => {
      await onSubmit(dto);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-slate-600">عنوان</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-slate-600">اسلاگ</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs text-slate-600">لوگو (URL)</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          فعال
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "در حال ذخیره..." : submitLabel}
      </button>
    </form>
  );
}
