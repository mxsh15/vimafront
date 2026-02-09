export type PublicAmazingProduct = {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number;
    oldPrice: number | null;
    discountPercent: number | null;
};