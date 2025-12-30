import {
  HomeIcon,
  PhotoIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  NewspaperIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  ArrowUturnLeftIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ReceiptRefundIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

export type AdminNavItem = {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavTop: AdminNavItem[] = [
  { name: "داشبورد", href: "/admin", icon: HomeIcon },
  { name: "کتابخانه چند رسانه ای", href: "/admin/media", icon: PhotoIcon },
];

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "کاربران و دسترسی",
    items: [
      { name: "کاربران", href: "/admin/users", icon: UserGroupIcon },
      { name: "نقش‌ها", href: "/admin/roles", icon: ShieldCheckIcon },
      { name: "دسترسی‌ها", href: "/admin/permissions", icon: KeyIcon },
    ],
  },
  {
    title: "تنظیمات",
    items: [
      {
        name: "تنظیمات سایت",
        href: "/admin/settings",
        icon: AdjustmentsHorizontalIcon,
      },
    ],
  },
  {
    title: "گزارش ها",
    items: [
      { name: "اعلان‌ها", href: "/admin/notifications", icon: BellAlertIcon },
      { name: "سیستمی", href: "/admin/reports", icon: ShieldCheckIcon },
      { name: "لاگ ها", href: "/admin/audit-logs", icon: ShieldCheckIcon },
    ],
  },
  {
    title: "محصولات",
    items: [
      { name: "فروشندگان", href: "/admin/vendors", icon: RectangleGroupIcon },
      {
        name: "پیشنهاد فروشندگان",
        href: "/admin/vendor-offers",
        icon: RectangleGroupIcon,
      },
      { name: "برندها", href: "/admin/brands", icon: RectangleGroupIcon },
      {
        name: "دسته بندی محصولات",
        href: "/admin/categories",
        icon: Squares2X2Icon,
      },
      {
        name: "ویژگی‌ها",
        href: "/admin/spec-attributes",
        icon: AdjustmentsHorizontalIcon,
      },
      {
        name: "گروه‌های ویژگی",
        href: "/admin/spec-groups",
        icon: AdjustmentsHorizontalIcon,
      },
      { name: "برچسب ها", href: "/admin/tags", icon: TagIcon },
      { name: "محصولات", href: "/admin/products", icon: ShoppingBagIcon },
    ],
  },
  {
    title: "تنظیمات حمل و نقل محصولات",
    items: [
      {
        name: "روش‌های ارسال",
        href: "/admin/shipping-methods",
        icon: RectangleGroupIcon,
      },
      {
        name: "مناطق ارسال",
        href: "/admin/shipping-zones",
        icon: RectangleGroupIcon,
      },
    ],
  },
  {
    title: "فروش و عملیات",
    items: [
      { name: "سفارش‌ها", href: "/admin/orders", icon: ShoppingBagIcon },
      { name: "پرداخت‌ها", href: "/admin/payments", icon: ShoppingBagIcon },
      { name: "مرسوله‌ها", href: "/admin/shipments", icon: RectangleGroupIcon },
    ],
  },
  {
    title: "فروش و تخفیف",
    items: [
      { name: "کوپن‌ها", href: "/admin/coupons", icon: TagIcon },
      {
        name: "تخفیف‌ها",
        href: "/admin/discounts",
        icon: AdjustmentsHorizontalIcon,
      },
      { name: "سبدهای خرید", href: "/admin/carts", icon: ShoppingBagIcon },
      {
        name: "آدرس‌های ارسال",
        href: "/admin/shipping-addresses",
        icon: MapPinIcon,
      },
      {
        name: "آدرس‌های رهاشده",
        href: "/admin/shipping-addresses/abandoned",
        icon: ArchiveBoxIcon,
      },
      { name: "مرجوعی‌ها", href: "/admin/returns", icon: ArrowUturnLeftIcon },
    ],
  },
  {
    title: "مالی فروشندگان",
    items: [
      {
        name: "مالی فروشندگان",
        href: "/admin/vendor-finance/wallets",
        icon: BanknotesIcon,
      },
      {
        name: "تراکنش‌ها",
        href: "/admin/vendor-finance/transactions",
        icon: ArrowsRightLeftIcon,
      },
      {
        name: "تسویه‌ها",
        href: "/admin/vendor-finance/payouts",
        icon: ReceiptRefundIcon,
      },
    ],
  },
  {
    title: "تعاملات",
    items: [
      {
        name: "دیدگاه‌ها",
        href: "/admin/reviews",
        icon: ChatBubbleLeftRightIcon,
      },
      {
        name: "سؤالات محصولات",
        href: "/admin/product-questions",
        icon: QuestionMarkCircleIcon,
      },
      {
        name: "لیست علاقه مندی ها",
        href: "/admin/wishlists",
        icon: ChatBubbleLeftRightIcon,
      },
    ],
  },
  {
    title: "بلاگ",
    items: [
      { name: "نوشته‌ها", href: "/admin/blog-posts", icon: NewspaperIcon },
      {
        name: "دسته‌های بلاگ",
        href: "/admin/blog-categories",
        icon: Squares2X2Icon,
      },
      { name: "برچسب‌های بلاگ", href: "/admin/blog-tags", icon: TagIcon },
    ],
  },
];
