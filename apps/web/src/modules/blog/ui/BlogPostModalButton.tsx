  "use client";

  import { useEffect, useMemo, useState, useTransition } from "react";
  import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
  } from "@headlessui/react";
  import { PlusIcon } from "lucide-react";

  import RichHtmlEditor from "@/components/admin/RichHtmlEditor";
  import MediaPickerDialog from "@/modules/media/ui/MediaPickerDialog";
  import { resolveMediaUrl } from "@/modules/media/resolve-url";

  import { upsertBlogPostFormAction } from "../actions";
  import type {
    BlogPostDto,
    BlogCategoryOptionDto,
    BlogTagOptionDto,
    AuthorOptionDto,
  } from "../types";
  import { normalizeSlug } from "@/lib/slug";
  import { createBlogTagClient } from "@/modules/blog-taxonomy/client-api";
  import {
    SchemaPresetId,
    buildSchemaTemplate,
    schemaPresets,
  } from "@/modules/seo/schema-presets";
  import { resolveMediaIdByUrl } from "../api.client";
  import { MediaAssetDto } from "@/modules/media/types";
  import { getMediaByIdFromClient } from "@/modules/media/actions";
  import formatBytes from "@/modules/media/helper";


  const SEO_TITLE_LIMIT = 60;
  const SEO_DESC_LIMIT = 160;

  function getSeoBarClass(len: number, max: number) {
    if (len === 0) return "bg-gray-200";
    if (len <= max) return "bg-emerald-500";
    return "bg-red-500";
  }

  type Cat = BlogCategoryOptionDto;

  function buildCategoryTreeOrder(categories: Cat[]) {
    const byParent = new Map<string, Cat[]>();
    const roots: Cat[] = [];

    for (const c of categories ?? []) {
      const pid = c.parentId ?? "";
      if (!c.parentId) roots.push(c);
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid)!.push(c);
    }

    // مرتب‌سازی الفبایی برای نمایش بهتر
    const sortByName = (a: Cat, b: Cat) => a.name.localeCompare(b.name, "fa");
    roots.sort(sortByName);
    for (const [, list] of byParent) list.sort(sortByName);

    const ordered: Array<{ cat: Cat; level: number }> = [];

    const dfs = (parentId: string, level: number) => {
      const children = byParent.get(parentId) ?? [];
      for (const child of children) {
        ordered.push({ cat: child, level });
        dfs(child.id, level + 1);
      }
    };

    // ریشه‌ها
    for (const r of roots) {
      ordered.push({ cat: r, level: 0 });
      dfs(r.id, 1);
    }

    return ordered;
  }


  type Props = {
    post?: BlogPostDto | null;
    categoryOptions: BlogCategoryOptionDto[];
    tagOptions: BlogTagOptionDto[];
    initialCategoryIds?: string[];
    initialTagIds?: string[];
    triggerVariant?: "primary" | "outline";
    label?: string;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
    hideTrigger?: boolean;
    authorOptions: AuthorOptionDto[];
  };


  export default function BlogPostModalButton({
    post,
    categoryOptions,
    tagOptions,
    initialCategoryIds,
    initialTagIds,
    triggerVariant = "outline",
    label,
    open,
    onOpenChange,
    hideTrigger,
    authorOptions = [],
  }: Props) {
    const [pending, startTransition] = useTransition();

    // --- controlled vs uncontrolled open state
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const isOpen = isControlled ? (open as boolean) : internalOpen;
    const setIsOpen = isControlled ? (onOpenChange as (v: boolean) => void) : setInternalOpen;

    const isEdit = !!post;

    /* ------------------ main content ------------------ */
    const [title, setTitle] = useState(post?.title ?? "");
    const [slug, setSlug] = useState(post?.slug ?? "");
    const [contentHtml, setContentHtml] = useState(post?.contentHtml ?? "");
    const [status, setStatus] = useState<number>(Number((post as any)?.status ?? 1));

    /* ------------------ author ------------------ */
    const [authorId, setAuthorId] = useState<string>(post?.authorId ?? "");

    /* ------------------ Normalized slug ------------------ */
    const normalizeSlugField = (value: string, title?: string) =>
      normalizeSlug(value || title || "");

    /* ------------------ image ------------------ */
    const [thumbnailMediaId, setThumbnailMediaId] = useState<string | null>(post?.thumbnailMediaId ?? null);
    const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(
      post?.thumbnailImageUrl ?? null
    );
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

    const [thumbnailMeta, setThumbnailMeta] = useState<MediaAssetDto | null>(null);
    const [thumbnailMetaLoading, setThumbnailMetaLoading] = useState(false);

    /* ------------------ categories ------------------ */
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
      initialCategoryIds ?? post?.categoryIds ?? []
    );

    /* ------------------ tags ------------------ */
    const [allTags, setAllTags] = useState<BlogTagOptionDto[]>(tagOptions ?? []);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
      initialTagIds ?? post?.tagIds ?? []
    );
    const [newTagName, setNewTagName] = useState("");
    const [tagCreating, setTagCreating] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);

    // اگر tagOptions از بیرون تغییر کرد (مثل صفحه لیست)
    useEffect(() => {
      setAllTags(tagOptions ?? []);
    }, [tagOptions]);

    const handleCreateTag = async () => {
      const name = newTagName.trim();
      if (!name) return;

      try {
        setTagCreating(true);
        setTagError(null);

        const created = await createBlogTagClient(name);

        setAllTags((prev) =>
          prev.some((t) => t.id === created.id) ? prev : [...prev, created]
        );
        setSelectedTagIds((prev) =>
          prev.includes(created.id) ? prev : [...prev, created.id]
        );
        setNewTagName("");
      } catch (err: any) {
        setTagError(err?.message ?? "ایجاد برچسب ناموفق بود");
      } finally {
        setTagCreating(false);
      }
    };

    /* ------------------ SEO ------------------ */
    const [seoTitle, setSeoTitle] = useState(post?.metaTitle ?? "");
    const [seoMetaDescription, setSeoMetaDescription] = useState(
      post?.metaDescription ?? ""
    );
    const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(
      post?.canonicalUrl ?? ""
    );
    const [seoSchemaJson, setSeoSchemaJson] = useState<string>(post?.seoSchemaJson ?? "");
    const [schemaPresetId, setSchemaPresetId] = useState<SchemaPresetId | "">(post?.schemaPresetId ?? "");
    const seoTitleLength = seoTitle.trim().length;
    const seoDescLength = seoMetaDescription.trim().length;

    // schema presets (مثل محصول)
    const applySchemaPreset = (id: SchemaPresetId) => {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://example.com";

      const json = buildSchemaTemplate(id, {
        origin,
        slug: post?.slug,
        title: post?.title ?? seoTitle,
        descriptionHtml: contentHtml,
        fallbackMetaDescription: seoMetaDescription,
        imagePath: thumbnailImageUrl ?? undefined,
        price: null,
        createdAtUtc: (post as any)?.createdAtUtc ?? null,
        updatedAtUtc: (post as any)?.updatedAtUtc ?? null,
      });

      setSeoSchemaJson(JSON.stringify(json, null, 2));
    };

    // meta robots
    const [robotsIndex, setRobotsIndex] = useState(false);
    const [robotsNoIndex, setRobotsNoIndex] = useState(false);
    const [robotsNoFollow, setRobotsNoFollow] = useState(false);
    const [robotsNoArchive, setRobotsNoArchive] = useState(false);
    const [robotsNoSnippet, setRobotsNoSnippet] = useState(false);
    const [robotsNoImageIndex, setRobotsNoImageIndex] = useState(false);

    useEffect(() => {
      const robots = (post?.seoMetaRobots ?? "").toLowerCase();
      setRobotsNoIndex(robots.includes("noindex"));
      setRobotsIndex(!robots.includes("noindex") && robots.includes("index"));
      setRobotsNoFollow(robots.includes("nofollow"));
      setRobotsNoArchive(robots.includes("noarchive"));
      setRobotsNoSnippet(robots.includes("nosnippet"));
      setRobotsNoImageIndex(robots.includes("noimageindex"));
    }, [post]);

    const computedSeoMetaRobots = useMemo(() => {
      const tokens: string[] = [];
      if (robotsNoIndex) tokens.push("noindex");
      else if (robotsIndex) tokens.push("index");
      if (robotsNoFollow) tokens.push("nofollow");
      if (robotsNoArchive) tokens.push("noarchive");
      if (robotsNoSnippet) tokens.push("nosnippet");
      if (robotsNoImageIndex) tokens.push("noimageindex");
      return tokens.join(",");
    }, [
      robotsIndex,
      robotsNoIndex,
      robotsNoFollow,
      robotsNoArchive,
      robotsNoSnippet,
      robotsNoImageIndex,
    ]);

    // ✅ خیلی مهم: وقتی post تغییر می‌کند (مثلاً بعد از fetch برای edit)، stateها sync شوند
    useEffect(() => {
      setTitle(post?.title ?? "");
      setSlug(post?.slug ?? "");
      setContentHtml(post?.contentHtml ?? "");
      setThumbnailMediaId((post as any)?.thumbnailMediaId ?? null);
      setThumbnailImageUrl(post?.thumbnailImageUrl ?? null);

      setSelectedCategoryIds(initialCategoryIds ?? post?.categoryIds ?? [])
      setSelectedTagIds(initialTagIds ?? post?.tagIds ?? [])

      setSeoTitle(post?.metaTitle ?? "");
      setSeoMetaDescription(post?.metaDescription ?? "");
      setSeoCanonicalUrl(post?.canonicalUrl ?? "");
      setSeoSchemaJson(post?.seoSchemaJson ?? "");
      setStatus(Number((post as any)?.status ?? 1));
      setAuthorId(post?.authorId ?? "");
    }, [post, initialCategoryIds, initialTagIds]);

    /* ------------------ submit ------------------ */
    const onSubmit = (formData: FormData) => {
      const rawTitle = String(formData.get("title") ?? "").trim();
      const rawSlug = String(formData.get("slug") ?? "").trim();

      formData.set("slug", normalizeSlugField(rawSlug, rawTitle));
      formData.set("contentHtml", contentHtml);
      formData.set("thumbnailMediaId", thumbnailMediaId ?? "");
      formData.delete("categoryIds");
      selectedCategoryIds.forEach((id) => formData.append("categoryIds", id));
      formData.delete("tagIds");
      selectedTagIds.forEach((id) => formData.append("tagIds", id));
      formData.set("seoSchemaJson", seoSchemaJson ?? "");
      formData.set("status", String(status));
      formData.set("authorId", authorId ?? "");
      startTransition(async () => {
        await upsertBlogPostFormAction(formData);
        setIsOpen(false);
      });
    };


    function handleSchemaPresetChange(presetId: SchemaPresetId) {
      setSchemaPresetId(presetId);

      const template = buildSchemaTemplate(presetId, {
        title,
        slug,
        origin: ""
      });

      const jsonString =
        typeof template === "string" ? template : JSON.stringify(template, null, 2);

      setSeoSchemaJson(jsonString);
    }

    useEffect(() => {
      console.log("authorOptions:", authorOptions);
      console.log("authorOptions length:", authorOptions?.length);
      console.log("authorOptions first:", authorOptions?.[0]);
    }, [authorOptions]);

    const orderedCategories = useMemo(() => {
      return buildCategoryTreeOrder(categoryOptions ?? []);
    }, [categoryOptions]);


    useEffect(() => {
      let cancelled = false;

      const loadMeta = async () => {
        if (!thumbnailMediaId) {
          setThumbnailMeta(null);
          return;
        }

        try {
          setThumbnailMetaLoading(true);
          const dto = await getMediaByIdFromClient(thumbnailMediaId);
          if (!cancelled) setThumbnailMeta(dto);
        } catch {
          if (!cancelled) setThumbnailMeta(null);
        } finally {
          if (!cancelled) setThumbnailMetaLoading(false);
        }
      };

      loadMeta();
      return () => {
        cancelled = true;
      };
    }, [thumbnailMediaId]);


    /* ------------------ UI ------------------ */
    return (
      <>
        {!hideTrigger && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={
              triggerVariant === "primary"
                ? "inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-xs text-white"
                : "inline-flex items-center gap-1 rounded border px-3 py-1.5 text-xs"
            }
          >
            {!isEdit && <PlusIcon size={14} />}
            {label ?? (isEdit ? "ویرایش نوشته" : "افزودن نوشته")}
          </button>
        )}

        <Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
          <DialogBackdrop className="fixed inset-0 bg-black/40" />

          <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
              <DialogPanel
                className="relative w-full max-w-6xl overflow-hidden rounded-xl bg-[#f0f0f1] shadow-xl sm:my-6"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#f0f0f1] border-b border-gray-300 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-sm font-semibold">
                      {isEdit ? "ویرایش نوشته" : "ایجاد نوشته جدید"}
                    </DialogTitle>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded border bg-white px-3 py-1 text-xs"
                      >
                        انصراف
                      </button>

                      <button
                        type="submit"
                        form="blog-post-form"
                        disabled={pending}
                        className="rounded bg-blue-600 px-4 py-1 text-xs text-white disabled:opacity-60"
                      >
                        {pending ? "در حال ذخیره..." : "ذخیره"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="max-h-[85vh] overflow-y-auto p-4">
                  <form
                    id="blog-post-form"
                    action={onSubmit}
                    className="grid gap-4 lg:grid-cols-[minmax(0,_2.5fr)_minmax(0,_1fr)]"
                  >
                    {/* LEFT */}
                    <div className="space-y-4">
                      <div className="rounded bg-white p-3">
                        <label className="block text-xs">عنوان نوشته</label>
                        <input
                          name="title"
                          defaultValue={post?.title ?? ""}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          onChange={(e) => setTitle(e.target.value)}
                        />

                        <label className="mt-2 block text-xs">نامک (Slug)</label>
                        <input
                          name="slug"
                          defaultValue={post?.slug ?? ""}
                          onChange={(e) => setSlug(e.target.value)}
                          dir="ltr"
                          onBlur={() => setSlug(normalizeSlugField(slug, title))}
                          className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs font-mono text-gray-800 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        />
                      </div>

                      <div className="rounded bg-white p-3">
                        <RichHtmlEditor value={contentHtml} onChange={setContentHtml} />
                      </div>

                      {/* SEO */}
                      <div className="rounded bg-white p-3 space-y-2">
                        <h3 className="text-xs font-semibold">SEO</h3>

                        <input
                          name="metaTitle"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Meta Title"
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        />
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                          <div className="flex-1 h-1 rounded bg-gray-200 overflow-hidden">
                            <div
                              className={`h-1 ${getSeoBarClass(
                                seoTitleLength,
                                SEO_TITLE_LIMIT
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (seoTitleLength / SEO_TITLE_LIMIT) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <span
                            className={
                              seoTitleLength > SEO_TITLE_LIMIT
                                ? "text-red-500"
                                : "text-emerald-600"
                            }
                          >
                            {seoTitleLength}/{SEO_TITLE_LIMIT}
                          </span>
                        </div>

                        <textarea
                          name="metaDescription"
                          value={seoMetaDescription}
                          onChange={(e) => setSeoMetaDescription(e.target.value)}
                          rows={2}
                          placeholder="Meta Description"
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        />
                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                          <div className="flex-1 h-1 rounded bg-gray-200 overflow-hidden">
                            <div
                              className={`h-1 ${getSeoBarClass(
                                seoDescLength,
                                SEO_DESC_LIMIT
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (seoDescLength / SEO_DESC_LIMIT) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <span
                            className={
                              seoDescLength > SEO_DESC_LIMIT
                                ? "text-red-500"
                                : "text-emerald-600"
                            }
                          >
                            {seoDescLength}/{SEO_DESC_LIMIT}
                          </span>
                        </div>

                        <label className="block text-right">
                          <span className="mb-1 block text-xs text-gray-700">
                            URL متعارف (Canonical)
                          </span>
                          <input
                            name="canonicalUrl"
                            value={seoCanonicalUrl}
                            onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                            dir="ltr"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                            placeholder="https://example.com/product/..."
                          />
                          <p className="mt-1 text-[11px] text-gray-500">
                            اگر خالی بماند، به‌طور خودکار از آدرس خود صفحه استفاده می‌شود.
                          </p>
                        </label>


                        {/* Schema JSON-LD */}
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              اسکیما (JSON-LD)
                            </span>
                            <span className="text-[11px] text-gray-400">
                              یک نوع اسکیما را انتخاب کنید یا JSON را ویرایش کنید.
                            </span>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {schemaPresets.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800"
                              >
                                <div className="text-right">
                                  <div className="font-semibold">{p.label}</div>
                                  <div className="text-[10px] text-gray-500">
                                    {p.schemaType} – {p.description}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => applySchemaPreset(p.id)}
                                  className="ml-2 rounded border border-indigo-500 px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50"
                                >
                                  استفاده +
                                </button>
                              </div>
                            ))}
                          </div>

                          <input type="hidden" name="seoSchemaJson" value={seoSchemaJson ?? ""} />
                          <textarea
                            rows={6}
                            dir="ltr"
                            value={seoSchemaJson}
                            onChange={(e) => setSeoSchemaJson(e.target.value)}
                            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                      <div className="rounded bg-white p-3 space-y-2">
                        <label className="block text-xs font-semibold text-gray-700">
                          وضعیت نوشته
                        </label>

                        <select
                          value={status}
                          onChange={(e) => setStatus(Number(e.target.value))}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs
                focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        >
                          <option value={1}>منتشر شده</option>
                          <option value={0}>پیش‌نویس</option>
                          <option value={2}>لیست‌نشده (Unlisted)</option>
                          <option value={3}>بایگانی</option>
                        </select>

                        <p className="text-[11px] text-gray-500">
                          نوشته‌های «لیست‌نشده» فقط با لینک مستقیم در دسترس هستند.
                        </p>
                      </div>

                      <div className="rounded border border-gray-300 bg-white text-right">
                        {/* image */}
                        <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800">
                          تصویر نوشته
                        </div>
                        <div className="px-3 py-3">
                          {thumbnailImageUrl ? (
                            <div className="mb-3">
                              <img
                                src={resolveMediaUrl(thumbnailImageUrl)}
                                className="w-full rounded border border-gray-200 object-contain"
                                alt="thumbnail"
                              />
                              <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-700">
                                {thumbnailMetaLoading ? (
                                  <div className="text-gray-500">در حال خواندن اطلاعات تصویر...</div>
                                ) : thumbnailMeta ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-gray-500">Title</span>
                                      <span className="font-medium truncate" title={thumbnailMeta.title ?? ""}>
                                        {thumbnailMeta.title ?? "—"}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-gray-500">Alt</span>
                                      <span className="font-medium truncate" title={thumbnailMeta.altText ?? ""}>
                                        {thumbnailMeta.altText ?? "—"}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-gray-500">حجم فایل</span>
                                      <span className="font-medium">{formatBytes(thumbnailMeta.fileSize)}</span>
                                    </div>

                                    {thumbnailMeta.contentType ? (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-500">نوع</span>
                                        <span className="font-medium">{thumbnailMeta.contentType}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <div className="text-gray-500">اطلاعات بیشتری برای این تصویر در دسترس نیست.</div>
                                )}
                              </div>

                            </div>
                          ) : (
                            <div className="mb-3 flex h-32 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
                              هنوز تصویری انتخاب نشده است
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setMediaDialogOpen(true)}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            انتخاب تصویر شاخص
                          </button>
                        </div>
                      </div>

                      <div className="rounded bg-white p-3 space-y-2">
                        <label className="block text-xs font-semibold text-gray-700">
                          نویسنده
                        </label>

                        <select
                          value={authorId}
                          onChange={(e) => setAuthorId(e.target.value)}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs
                focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        >
                          <option value="">(خودکار / کاربر جاری)</option>
                          {(authorOptions ?? []).map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName}
                            </option>
                          ))}
                        </select>

                        <p className="text-[11px] text-gray-500">
                          اگر خالی بگذاری، نویسنده به صورت خودکار کاربر جاری ذخیره می‌شود.
                        </p>
                      </div>


                      {/* دسته‌های نوشته */}
                      <div className="rounded border border-gray-300 bg-white text-right">
                        <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800">
                          دسته‌های محصول
                        </div>
                        <div className="px-3 py-3">
                          <div className="max-h-72 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700 space-y-1">
                            {orderedCategories.map(({ cat, level }) => (
                              <label
                                key={cat.id}
                                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white"
                                style={{ paddingRight: `${level * 16}px` }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategoryIds.includes(cat.id)}
                                  onChange={(e) =>
                                    setSelectedCategoryIds((prev) =>
                                      e.target.checked ? [...prev, cat.id] : prev.filter((x) => x !== cat.id)
                                    )
                                  }
                                />
                                <span className={level === 0 ? "font-semibold" : ""}>
                                  {level > 0 ? "— " : ""}
                                  {cat.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded bg-white p-3 text-xs space-y-1">
                        {allTags.map((t) => (
                          <label key={t.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTagIds.includes(t.id)}
                              onChange={(e) =>
                                setSelectedTagIds((prev) =>
                                  e.target.checked
                                    ? [...prev, t.id]
                                    : prev.filter((x) => x !== t.id)
                                )
                              }
                            />
                            {t.name}
                          </label>
                        ))}

                        <div className="pt-2">
                          <input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="w-full rounded border px-2 py-1 text-xs"
                            placeholder="برچسب جدید"
                          />
                          <button
                            type="button"
                            onClick={handleCreateTag}
                            disabled={tagCreating || !newTagName.trim()}
                            className="mt-1 w-full rounded bg-emerald-600 py-1 text-[11px] text-white disabled:opacity-60"
                          >
                            {tagCreating ? "در حال افزودن..." : "افزودن برچسب"}
                          </button>
                          {tagError && (
                            <p className="mt-1 text-[10px] text-red-500">{tagError}</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {thumbnailMediaId && <input type="hidden" name="thumbnailMediaId" value={thumbnailMediaId} />}
                    {post?.id && <>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="seoMetaRobots" value={computedSeoMetaRobots} />
                      <input type="hidden" name="status" value={String(status)} />
                      <input type="hidden" name="authorId" value={authorId ?? ""} />
                    </>}
                  </form>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>

        <MediaPickerDialog
          open={mediaDialogOpen}
          onClose={() => setMediaDialogOpen(false)}
          multiple={false}
          onSelect={(urls) => {
            const url = urls?.[0];
            if (!url) return;
            setThumbnailImageUrl(url);
            setMediaDialogOpen(false);
            resolveMediaIdByUrl(url)
              .then(async (id) => {
                setThumbnailMediaId(id);

                if (id) {
                  try {
                    setThumbnailMetaLoading(true);
                    const dto = await getMediaByIdFromClient(id);
                    setThumbnailMeta(dto);
                  } catch {
                    setThumbnailMeta(null);
                  } finally {
                    setThumbnailMetaLoading(false);
                  }
                } else {
                  setThumbnailMeta(null);
                }
              })
              .catch(() => {
                setThumbnailMediaId(null);
                setThumbnailMeta(null);
              });

          }}
          hasInitialImage={!!thumbnailImageUrl}
          initialSelectedUrls={thumbnailImageUrl ? [thumbnailImageUrl] : []}
        />
      </>
    );
  }
