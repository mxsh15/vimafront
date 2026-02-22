import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { isMobileRequest } from "@/lib/device/isMobileRequest";

import PublicFooter from "./PublicFooter";
import PublicFooterMobile from "./PublicFooterMobile";

export default async function PublicFooterShell() {
    noStore();

    const h = await headers();
    const ua = h.get("user-agent");
    const chMobile = h.get("sec-ch-ua-mobile");
    const isMobile = isMobileRequest(ua, chMobile);

    return isMobile ? <PublicFooterMobile /> : <PublicFooter />;
}