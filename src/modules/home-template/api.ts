import { apiFetch } from "@/lib/api";
import type {
    AdminHomeTemplateListItem,
    AdminHomeTemplateDetail,
    PublicHomeLayout,
} from "./types";

// لیست قالب‌ها (کارت‌ها)
export async function listAdminHomeTemplates() {
    return apiFetch<{ items: AdminHomeTemplateListItem[] }>(
        "admin/home-templates"
    );
}

// گرفتن جزئیات یک قالب
export async function getAdminHomeTemplate(id: string) {
    return apiFetch<AdminHomeTemplateDetail>(
        `admin/home-templates/${id}`
    );
}

// ساخت قالب جدید
export async function createAdminHomeTemplate(dto: {
    title: string;
    slug: string;
    description?: string | null;
    thumbnailMediaAssetId?: string | null;
    isEnabled: boolean;
}) {
    return apiFetch<{ id: string }>("admin/home-templates", {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

// ویرایش اطلاعات قالب
export async function updateAdminHomeTemplate(
    id: string,
    dto: {
        title: string;
        slug: string;
        description?: string | null;
        thumbnailMediaAssetId?: string | null;
        isEnabled: boolean;
    }
) {
    return apiFetch<void>(`admin/home-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

// ذخیره سکشن‌های قالب (page builder)
export async function saveAdminHomeTemplateSections(
    id: string,
    sections: any[]
) {
    return apiFetch<void>(`admin/home-templates/${id}/sections`, {
        method: "PUT",
        body: JSON.stringify({ sections }),
    });
}

// فعال‌کردن قالب برای فروشگاه
export async function activateAdminHomeTemplate(id: string) {
    return apiFetch<void>(`admin/home-templates/${id}/activate`, {
        method: "POST",
    });
}

// کپی قالب
export async function cloneAdminHomeTemplate(id: string) {
    return apiFetch<{ id: string }>(
        `admin/home-templates/${id}/clone`,
        {
            method: "POST",
        }
    );
}

// حذف قالب
export async function deleteAdminHomeTemplate(id: string) {
    return apiFetch<void>(`admin/home-templates/${id}`, {
        method: "DELETE",
    });
}

// گرفتن layout صفحه اصلی برای رندر Home
export async function getPublicHomeLayout() {
    return apiFetch<PublicHomeLayout>("public/home-layout");
}

