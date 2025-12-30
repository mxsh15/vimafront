export type MediaKind = "Image" | "Video" | "Document" | "Audio" | "Other";
export type MediaProvider = "Upload" | "ExternalUrl" | "Cdn";
export type MediaUsage =
  | "General"
  | "ProductGallery"
  | "BrandLogo"
  | "CategoryImage"
  | "Banner";

export type MediaAssetDto = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  fileSize?: number | null;
  contentType?: string | null;
  altText?: string | null;
  title?: string | null;
  kind: MediaKind;
  provider: MediaProvider;
  usage: MediaUsage;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

// پارامترهای لیست مدیا
export type ListMediaParams = {
  page?: number;
  pageSize?: number;
  usage?: string;
  kind?: MediaKind;
  q?: string;
};

export type MediaUpdateInput = {
  altText?: string;
  title?: string;
  usage?: MediaUsage;
};

export type MediaItem = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
};

export type MediaPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};
