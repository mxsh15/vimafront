export type UserRole = "Customer" | "Vendor" | "Admin";

export type VendorInfoDto = {
  id: string;
  storeName: string;
  role: string;
  isActive: boolean;
};

export type UserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  vendorId?: string;
  vendorIds?: string[];
  vendors?: VendorInfoDto[];
};

export type AuthResponseDto = {
  token: string;
  user: UserDto;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};
