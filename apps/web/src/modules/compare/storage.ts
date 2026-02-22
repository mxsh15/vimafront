export type CompareState = {
    categoryId: string | null;
    productIds: string[];
    baseProductId: string | null;
};

const KEY = "compare:v1";

export function loadCompareState(): CompareState {
    if (typeof window === "undefined") return { categoryId: null, productIds: [], baseProductId: null };

    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return { categoryId: null, productIds: [], baseProductId: null };

        const parsed = JSON.parse(raw) as Partial<CompareState>;

        const productIds = Array.isArray(parsed?.productIds)
            ? parsed!.productIds!.filter(Boolean).slice(0, 4)
            : [];

        const baseProductId =
            typeof parsed?.baseProductId === "string" && parsed.baseProductId
                ? parsed.baseProductId
                : (productIds[0] ?? null);

        return {
            categoryId: parsed?.categoryId ?? null,
            productIds,
            baseProductId,
        };
    } catch {
        return { categoryId: null, productIds: [], baseProductId: null };
    }
}

export function saveCompareState(state: CompareState) {
    if (typeof window === "undefined") return;

    const productIds = (state.productIds ?? []).filter(Boolean).slice(0, 4);
    const baseProductId = state.baseProductId ?? productIds[0] ?? null;

    window.localStorage.setItem(
        KEY,
        JSON.stringify({
            categoryId: state.categoryId ?? null,
            productIds,
            baseProductId,
        })
    );
}

export function clearCompareState() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
}

export function removeFromCompare(productId: string): { state: CompareState; blocked: boolean } {
    const cur = loadCompareState();

    if (cur.baseProductId && cur.baseProductId === productId) {
        return { state: cur, blocked: true };
    }

    const nextIds = cur.productIds.filter((x) => x !== productId);

    const next: CompareState = {
        categoryId: nextIds.length ? cur.categoryId : null,
        productIds: nextIds,
        baseProductId: nextIds.length ? (cur.baseProductId && nextIds.includes(cur.baseProductId) ? cur.baseProductId : nextIds[0]) : null,
    };

    saveCompareState(next);
    return { state: next, blocked: false };
}

export function addToCompare(
    productId: string,
    categoryId: string | null
): {
    state: CompareState;
    action: "added" | "exists" | "reset_added" | "full";
} {
    const cur = loadCompareState();

    if (cur.productIds.includes(productId)) {
        return { state: cur, action: "exists" };
    }

    if (cur.productIds.length >= 4) {
        return { state: cur, action: "full" };
    }

    if (cur.categoryId && categoryId && cur.categoryId !== categoryId) {
        const next: CompareState = { categoryId, productIds: [productId], baseProductId: productId };
        saveCompareState(next);
        return { state: next, action: "reset_added" };
    }

    const nextIds = [...cur.productIds, productId].slice(0, 4);

    const next: CompareState = {
        categoryId: cur.categoryId ?? categoryId ?? null,
        productIds: nextIds,
        // اگر هنوز base نداریم یعنی اولین محصول است
        baseProductId: cur.baseProductId ?? (cur.productIds.length === 0 ? productId : nextIds[0]),
    };

    saveCompareState(next);
    return { state: next, action: "added" };
}