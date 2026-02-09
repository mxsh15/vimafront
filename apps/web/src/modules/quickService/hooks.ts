"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicQuickServices } from "./api";

export const quickServicesKeys = {
    public: ["quick-services", "public"] as const,
};

export function usePublicQuickServices() {
    return useQuery({
        queryKey: quickServicesKeys.public,
        queryFn: () => getPublicQuickServices(),
        staleTime: 1000 * 60 * 5,
    });
}
