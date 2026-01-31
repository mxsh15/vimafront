import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminHomeBannerUpsert } from "./types";
import { adminCreateHomeBanner, adminDeleteHomeBanner, adminListHomeBanners, adminUpdateHomeBanner, getPublicHomeBanners } from "./api";

export const homeBannersKeys = {
    public: ["home-banners", "public"] as const,
    adminList: (page: number, pageSize: number, q: string, status: string) =>
        ["home-banners", "admin", page, pageSize, q, status] as const,
};

export function usePublicHomeBanners() {
    return useQuery({
        queryKey: homeBannersKeys.public,
        queryFn: getPublicHomeBanners,
    });
}

export function useAdminHomeBannersList(args: {
    page: number;
    pageSize: number;
    q: string;
    status: "all" | "active" | "inactive";
}) {
    return useQuery({
        queryKey: homeBannersKeys.adminList(args.page, args.pageSize, args.q, args.status),
        queryFn: () => adminListHomeBanners(args),
    });
}

export function useAdminCreateHomeBanner() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: AdminHomeBannerUpsert) => adminCreateHomeBanner(dto),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["home-banners"] });
        },
    });
}

export function useAdminUpdateHomeBanner() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: AdminHomeBannerUpsert }) =>
            adminUpdateHomeBanner(id, dto),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["home-banners"] });
        },
    });
}

export function useAdminDeleteHomeBanner() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDeleteHomeBanner(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["home-banners"] });
        },
    });
}
