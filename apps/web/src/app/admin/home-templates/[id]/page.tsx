import { getAdminHomeTemplate } from "@/modules/home-template/api";
import HomeTemplateEditorPageClient from "./HomeTemplateEditorPageClient";
import { notFound } from "next/navigation";

function isGuid(x: string) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(x);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isGuid(id)) throw new Error(`Invalid route param id: "${id}"`);
    try {
        const data = await getAdminHomeTemplate(id);
        return <HomeTemplateEditorPageClient initial={data} />;
    } catch (e: any) {
        if (e?.status === 404) notFound();
        throw e;
    }
}
