export type ProductQuestionDto = {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userFullName: string;
  question: string;
  isApproved: boolean;
  isAnswered: boolean;
  answersCount: number;
  createdAtUtc: string;
};

export type ProductAnswerDto = {
  id: string;
  questionId: string;
  answer: string;
  isVerified: boolean;
  vendorId?: string | null;
  vendorName?: string | null;
  userId?: string | null;
  userFullName?: string | null;
  createdAtUtc: string;
};

export type ProductQuestionRow = ProductQuestionDto;

export type ProductAnswerAdminDto = {
  id: string;
  questionId: string;
  answer: string;
  isVerified: boolean;
  vendorId?: string | null;
  vendorName?: string | null;
  userId?: string | null;
  userFullName?: string | null;
  createdAtUtc: string;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
};

export type ProductQuestionDetailDto = {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userFullName: string;
  question: string;
  isApproved: boolean;
  isAnswered: boolean;
  createdAtUtc: string;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
  answers: ProductAnswerAdminDto[];
};


export type PublicAnswerDto = {
  id: string;
  questionId: string;
  answer: string;
  isVerified: boolean;
  vendorId: string | null;
  vendorStoreName: string | null;
  userId: string | null;
  userFullName: string | null;
  createdAtUtc: string;
  likeCount: number;
  dislikeCount: number;
  userVote?: number | null; // 1 | -1 | 0
};


export type PublicQuestionDto = {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userFullName: string;
  question: string;
  isAnswered: boolean;
  answersCount: number;
  createdAtUtc: string;
  answers?: PublicAnswerDto[] | null;
};

export type VoteAnswerResultDto = {
  likeCount: number;
  dislikeCount: number;
  userVote: 1 | -1 | 0;
};
