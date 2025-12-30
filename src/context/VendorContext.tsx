"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { listMyVendors } from "@/modules/vendor/api";
import type { VendorListItemDto } from "@/modules/vendor/types";

type VendorContextType = {
    myVendors: VendorListItemDto[];
    currentVendorId?: string;
    setCurrentVendorId: (id: string) => void;
    loading: boolean;
};

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
    const [myVendors, setMyVendors] = useState<VendorListItemDto[]>([]);
    const [currentVendorId, setCurrentVendorId] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const data = await listMyVendors();
                setMyVendors(data);
                if (data.length === 1) {
                    setCurrentVendorId(data[0].id);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <VendorContext.Provider
            value={{ myVendors, currentVendorId, setCurrentVendorId, loading }}
        >
            {children}
        </VendorContext.Provider>
    );
}

export function useVendor() {
    const ctx = useContext(VendorContext);
    if (!ctx) throw new Error("useVendor must be used within VendorProvider");
    return ctx;
}
