export type ReviewDto = {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userFullName: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAtUtc: string;
};

export type ReviewRow = ReviewDto;
