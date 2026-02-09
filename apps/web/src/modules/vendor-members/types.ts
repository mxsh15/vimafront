export type VendorMemberListItemDto = {
  id: string;
  vendorId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type AddVendorMemberDto = {
  userId: string;
  role: string;
  isActive: boolean;
};

export type UpdateVendorMemberDto = {
  role: string;
  isActive: boolean;
};
