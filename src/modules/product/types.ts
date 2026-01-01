export enum ProductStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export enum ProductSaleModel {
  OnlinePricing = 0,
  Inquiry = 1,
  ExternalLink = 2,
}

export type BrandOptionDto = {
  id: string;
  title: string;
};

export type ProductListItemDto = {
  defaultOfferManageStock: any;
  defaultOfferStockStatus: any;
  id: string;

  title: string;
  englishTitle?: string | null;
  shortTitle?: string | null;

  slug: string;
  sku?: string | null;

  descriptionHtml: string;

  isFeatured: boolean;
  allowCustomerReviews: boolean;
  allowCustomerQuestions: boolean;
  isVariantProduct: boolean;

  status: number;
  visibility: number;

  brandId?: string | null;
  brandTitle?: string | null;

  ownerVendorId?: string | null;
  ownerVendorStoreName?: string | null;

  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  seoMetaRobots?: string | null;
  seoSchemaJson?: string | null;
  autoGenerateSnippet: boolean;
  autoGenerateHeadTags: boolean;
  includeInSitemap: boolean;

  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  rowVersion: string;

  defaultOfferPrice?: number | null;
  defaultOfferDiscountPrice?: number | null;
  defaultOfferStockQuantity?: number | null;
  defaultOfferStock: number;
  saleModel: number;

  minVariantPrice?: number | null;
  maxVariantPrice?: number | null;
  totalVariantStock?: number | null;

  //rating?: number | null;

  primaryImageUrl?: string | null;
  categoryIds: string[];
  galleryImageUrls: string[];
  tagIds?: string[];

  minPrice?: number | null;
};

export type ProductUpsertInput = {
  id?: string;
  title: string;
  englishTitle?: string | null;
  slug: string;
  sku?: string | null;
  excerpt?: string | null;
  descriptionHtml?: string | null;
  additionalNotes?: string | null;
  reviewHtml?: string | null;
  isFeatured: boolean;
  enableQnA: boolean;
  enableComments: boolean;
  status: ProductStatus;
  brandId?: string | null;
  ownerVendorId?: string | null;
  seoTitle?: string | null;
  seoMetaDescription?: string | null;
  seoKeywords?: string | null;
  seoCanonicalUrl?: string | null;
  saleModel: ProductSaleModel;
  inquiryPhone?: string | null;
  inquiryMobile?: string | null;
  vendorCommissionPercent?: number | null;
  hasColorVariants: boolean;
  hasWarranty: boolean;
  guideHtml?: string | null;
  primaryImageUrl?: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  rowVersion?: string | null;
  tagIds?: string[];
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ProductDto = ProductListItemDto;

export type VendorOptionDto = {
  id: string;
  storeName: string;
};

export type VariantFormModel = {
  tempId: string;
  id?: string;
  variantCode: string;
  variantName: string;
  price: string;
  oldPrice: string;
  stock: string;
};

export type VariantRow = {
  tempId: string;
  id?: string;
  attributeId?: string;
  optionId?: string;
  variantCode?: string;
  sku: string;
  price: string;
  discountPrice: string;
  minVariablePrice: string;
  maxVariablePrice: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  description: string;
  minOrderQuantity: string;
  maxOrderQuantity: string;
  quantityStep: string;
  stock: string;
  manageStock: boolean;
  stockStatus: number;
  backorderPolicy: number;
  lowStockThreshold: string;
};

export type VariantAttributeValueDto = {
  attributeId: string;
  attributeTitle: string;
  optionId: string;
  optionTitle: string;
};

export type ProductVariantDetailDto = {
  sku: string;
  minVariablePrice?: number | null;
  maxVariablePrice?: number | null;
  weightKg?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  description: string | null;
  minOrderQuantity?: number | null;
  maxOrderQuantity?: number | null;
  quantityStep?: number | null;
  id: string;
  attributeId?: string | null;
  optionId?: string | null;
  variantCode?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stockQuantity?: number | null;
  manageStock?: boolean | null;
  stockStatus?: number | null;
  backorderPolicy?: number | null;
  lowStockThreshold?: number | null;
  stock?: number | null;
};

export type VendorOfferPublicDto = {
  id: string;
  vendorId: string;
  vendorName: string;

  price: number;
  discountPrice?: number | null;

  isDefaultForProduct: boolean;
  status: "Pending" | "Approved" | "Rejected" | "Disabled" | number;

  manageStock: boolean;
  stockQuantity: number;
  isDeleted: boolean;
};

export type ProductDetailDto = {
  id: string;
  title: string;
  slug?: string | null;
  descriptionHtml?: string | null;
  mainImageUrl?: string | null;
  vendorOffers: VendorOfferPublicDto[];
};

export type PublicProductCardDto = {
  id: string;
  title: string;
  primaryImageUrl?: string | null;
  minPrice?: number | null;
};

export type PublicVendorOfferDto = {
  id: string;
  vendorId: string;
  vendorName: string;
  price: number;
  discountPrice?: number | null;
  manageStock: boolean;
  stockQuantity: number;
  status: number | string;
  isDeleted: boolean;
};

export type PublicProductDto = {
  id: string;
  title: string;
  descriptionHtml?: string | null;
  primaryImageUrl?: string | null;
  vendorOffers?: PublicVendorOfferDto[];
};

export type PublicProductCoreDto = Pick<
  PublicProductDto,
  "id" | "title" | "descriptionHtml" | "primaryImageUrl"
>;

export type PublicProductOffersDto = {
  id: string;
  vendorOffers: PublicVendorOfferDto[];
};