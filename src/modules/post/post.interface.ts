import { PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";

export interface ICreatePostPayload {
  title: string;
  content: string;
  thumbnail?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  status?: PostStatus;
  tags: string[];
}

export interface IUpdatePostPayload {
  title?: string;
  content?: string;
  thumbnail?: string;
  isFeatured?: boolean;
  status?: PostStatus;
  tags: string[];
}

// সার্চ ফিল্টারিং এর জন্য
export interface IpostQuery extends PostWhereInput {
  title?: string;
  content?: string;
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: string;
}
