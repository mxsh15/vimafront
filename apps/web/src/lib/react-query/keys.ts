export type Id = string | number;

export const qk = {
  // Admin lists
  brands: (p?: {
    page?: number;
    pageSize?: number;
    q?: string;
    trash?: boolean;
  }) => ["brands", p ?? {}] as const,
  categories: (p?: Record<string, unknown>) => ["categories", p ?? {}] as const,
  products: (p?: Record<string, unknown>) => ["products", p ?? {}] as const,

  // Single entities
  brand: (id: Id) => ["brand", id] as const,
  product: (id: Id) => ["product", id] as const,

  // Shop
  cart: () => ["cart"] as const,
  wishlist: () => ["wishlist"] as const,

  // Lookups (dropdowns etc.)
  lookup: (name: string, p?: Record<string, unknown>) =>
    ["lookup", name, p ?? {}] as const,
} as const;
