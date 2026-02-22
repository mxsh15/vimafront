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
  likeCount: number;
  dislikeCount: number;
  createdAtUtc: string;
};
export type ReviewRow = ReviewDto;
