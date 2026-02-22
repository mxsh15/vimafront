export type CompareProductDto = {
  id: string;
  title: string;
  slug: string;
  primaryImageUrl?: string | null;
  minPrice?: number | null;
};

export type CompareRowDto = {
  title: string;
  unit?: string | null;
  values: (string | null)[];
};

export type CompareSectionDto = {
  title: string;
  rows: CompareRowDto[];
};

export type PublicCompareResponseDto = {
  products: CompareProductDto[];
  sections: CompareSectionDto[];
};

export type CompareRequestDto = {
  productIds: string[];
};