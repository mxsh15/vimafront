export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type AttributeSetListItemDto = {
  id: string;
  name: string;
  description?: string | null;
};

export type AttributeSetOptionDto = {
  id: string;
  name: string;
};

export type AttributeGroupListItemDto = {
  id: string;
  attributeSetId: string;
  attributeSetName: string;
  name: string;
  sortOrder: number;
  attributesCount: number;
  attributeIds: string[];
};

export type AttributeGroupDto = {
  id: string;
  attributeSetId: string;
  attributeSetName: string;
  name: string;
  sortOrder: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  rowVersion: string | null;
  attributeIds: string[];
};

export type AttributeGroupRow = AttributeGroupListItemDto & {
  createdAtUtc?: string;
};

export enum AttributeValueType {
  Text = 1,
  Number = 2,
  Boolean = 3,
  DateTime = 4,
  Option = 5,
  MultiOption = 6,
}

export type ProductAttributeListItemDto = {
  id: string;
  attributeGroupId: string;
  name: string;
  key: string;
  unit: string | null;
  valueType: number;
  isRequired: boolean;
  isVariantLevel: boolean;
  isFilterable: boolean;
  isComparable: boolean;
  sortOrder: number;
};

export type ProductAttributeDto = ProductAttributeListItemDto & {
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  isDeleted: boolean;
  rowVersion: string;
};

export type AttributeOptionDto = {
  id: string;
  attributeId: string;
  value: string;
  displayLabel: string | null;
  sortOrder: number;
  isDefault: boolean;
};

export type ProductAttributeOptionDto = {
  id: string;
  name: string;
  key: string;
};

export type AttributeGroupWithAttrsDto = AttributeGroupListItemDto & {
  rowVersion?: string | null;
  attributeIds?: string[];
};

export type ProductSpecItemDto = {
  id: string;
  attributeId: string;
  attributeName: string;
  attributeKey: string;
  valueType: AttributeValueType;
  attributeGroupId?: string | null;
  attributeGroupName?: string | null;
  optionId?: string | null;
  rawValue?: string | null;
  numericValue?: number | null;
  boolValue?: boolean | null;
  dateTimeValue?: string | null; // ISO string
  displayOrder: number;
};

export type ProductSpecItemUpsertDto = {
  id?: string | null;
  attributeId: string;
  attributeGroupId?: string | null;
  valueType: AttributeValueType;
  optionId?: string | null;
  rawValue?: string | null;
  numericValue?: number | null;
  boolValue?: boolean | null;
  dateTimeValue?: string | null;
  displayOrder: number;
};

export type UpsertProductSpecsRequest = {
  productId: string;
  items: ProductSpecItemUpsertDto[];
};

export type MultiOptionCellProps = {
  attributeId: string;
  options: AttributeOptionDto[];
  selectedIds: string[];
  disabled?: boolean;
  loading?: boolean;
  onChange: (ids: string[]) => void;
  onCreateOption: (label: string) => Promise<AttributeOptionDto>;
};
