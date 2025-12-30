export type UserRole = "Customer" | "Vendor" | "Admin";

export type VendorInfoDto = {
  id: string;
  storeName: string;
  role: string; // نقش کاربر در این Vendor (Owner, Manager, Staff, ...)
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
  vendorId?: string; // برای سازگاری با کدهای قدیمی - اولین Vendor با نقش Owner
  vendorIds?: string[]; // لیست تمام Vendorهایی که کاربر عضو آنهاست
  vendors?: VendorInfoDto[]; // اطلاعات کامل Vendorها
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
  role: UserRole;
};

