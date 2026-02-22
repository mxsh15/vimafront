"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

function isNetworkOrApiError(err: unknown) {
    // اینجا خیلی سخت نگیر. همین که error وجود داره و fetch ناکام بوده
    // برای Banner اتصال کافی است. اگر خواستی دقیق‌ترش کنی، اینجا توسعه بده.
    if (!err) return false;

    // Fetch/Axios common patterns
    const anyErr = err as any;
    const msg = String(anyErr?.message ?? "");
    const name = String(anyErr?.name ?? "");

    // خطاهای رایج شبکه
    if (
        /networkerror|failed to fetch|load failed|fetch failed|timeout|aborted/i.test(msg) ||
        /TypeError/i.test(name)
    ) {
        return true;
    }

    // Axios-ish
    if (anyErr?.isAxiosError) {
        // اگر response نداریم، یعنی احتمالاً شبکه/سرور در دسترس نیست
        if (!anyErr?.response) return true;
        const status = anyErr?.response?.status;
        // 5xx را به عنوان Down در نظر بگیر
        if (typeof status === "number" && status >= 500) return true;
    }

    // Generic HTTP-ish
    const status = anyErr?.status ?? anyErr?.response?.status;
    if (typeof status === "number" && status >= 500) return true;

    return false;
}

function computeApiDown(queryClient: ReturnType<typeof useQueryClient>) {
    const qc = queryClient.getQueryCache();
    const mc = queryClient.getMutationCache();

    // 1) Query errors
    const queries = qc.getAll();
    for (const q of queries) {
        // فقط query هایی که واقعاً اجرا شدند
        const status = q.state.status; // "pending" | "error" | "success"
        if (status !== "error") continue;

        // اگر error شبکه/سرور است => Down
        if (isNetworkOrApiError(q.state.error)) return true;
    }

    // 2) Mutation errors (مثلاً AddToCart)
    const mutations = mc.getAll();
    for (const m of mutations) {
        const status = m.state.status; // "idle" | "pending" | "error" | "success"
        if (status !== "error") continue;

        if (isNetworkOrApiError(m.state.error)) return true;
    }

    return false;
}

export default function ConnectivityBanner() {
    const queryClient = useQueryClient();

    // subscribe function برای useSyncExternalStore
    const subscribe = useMemo(() => {
        const qc = queryClient.getQueryCache();
        const mc = queryClient.getMutationCache();

        return (onStoreChange: () => void) => {
            // هر تغییر تو QueryCache یا MutationCache => snapshot دوباره محاسبه میشه
            const unsubQ = qc.subscribe(() => onStoreChange());
            const unsubM = mc.subscribe(() => onStoreChange());
            return () => {
                unsubQ();
                unsubM();
            };
        };
    }, [queryClient]);

    const apiDown = useSyncExternalStore(
        subscribe,
        () => computeApiDown(queryClient),
        () => false
    );

    if (!apiDown) return null;

    return (
        <div className="w-full bg-red-50 border-b border-red-200">
            <div className="mx-auto max-w-main px-4 py-2 text-body-2 text-red-700">
                اتصال به سرور برقرار نیست یا پاسخ‌دهی مشکل دارد. لطفاً اینترنت را بررسی کنید و دوباره تلاش کنید.
            </div>
        </div>
    );
}