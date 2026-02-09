export type ProductQuestionDto = {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userFullName: string;
  question: string;
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
  isAnswered: boolean;
  createdAtUtc: string;
  isDeleted: boolean;
  deletedAtUtc?: string | null;
  rowVersion: string;
  answers: ProductAnswerAdminDto[];
};
