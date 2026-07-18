import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IpostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IpostQuery) => {
  // pagination 1/2
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  // শর্টিং
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const SortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];

  const andConditions: PostWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: false,
  });

  const post = await prisma.post.findMany({
    where: {
      isPremium: true,
    },
    // পেজিনেশন 2/2
    take: limit,
    skip: skip,

    orderBy: {
      // sortby SortOrder
      [sortBy]: SortOrder,
    },

    // include এর মাধ্যমে তার নাম দেখাবে এবং post এর নিচের কমেন্ট গুলোও দেখাবে
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comment: true,
    },
  });
  const totalPostCount = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: post,
    meta: {
      page: page,
      limit: limit,
      total: totalPostCount,
      totalPages: Math.ceil(totalPostCount / limit),
    },
  };
};

export const premiumServices = {
  getPremiumContent,
};
