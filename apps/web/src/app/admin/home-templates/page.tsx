import { listAdminHomeTemplates } from "@/modules/home-template/api";
import HomeTemplatesPageClient from "./HomeTemplatesPageClient";

export const metadata = { title: "مدیریت قالب | پنل مدیریت" };

export default async function Page() {
    const data = await listAdminHomeTemplates();
    return <HomeTemplatesPageClient items={data.items} />;
}
