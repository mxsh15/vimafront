export type CategoryListItemDto = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  contentHtml: string | null;
  iconUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
};

export type CategoryDetailDto = {
  id: string;
  title: string;
  slug: string;
  contentHtml: string | null;
  iconUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
};

export type CategoryFormModel = {
  id?: string;
  title: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  iconUrl: string | null;
  contentHtml: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
};

export type CategoryEditModalProps = {
  open: boolean;
  onClose: () => void;
  category?: CategoryFormModel;
  parentOptions: CategoryOptionDto[];
};

export type ParentOption = {
  id: string;
  title: string;
};

export type CategoryOptionDto = {
  id: string;
  title: string;
  parentId?: string | null;
  sortOrder?: number;
  iconUrl?: string | null;
};

export type CategoryRowWithLevel = CategoryListItemDto & { level: number };


export type CategoryProductCardDto = {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string | null;
};

export type CategoryProductsGridDto = {
  categoryId: string;
  categoryTitle: string;
  categorySlug: string;
  items: CategoryProductCardDto[];
};

export type CategoryDto = {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
}