import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IpostQuery } from "./post.interface";
import { PostWhereInput } from "../../../generated/prisma/models";

const postCreate = async (Payload: ICreatePostPayload, userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  if (Payload.isPremium && user.subscription?.status !== "ACTIVE") {
    throw new Error(
      "You are not a premium user.So you can not create premium content",
    );
  }
  const result = await prisma.post.create({
    data: {
      ...Payload,
      authorId: userId,
    },
  });

  return result;
};

// get all posts logic

const getAllPosts = async (query: IpostQuery) => {
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

  const posts = await prisma.post.findMany({
    where: {
      AND: andConditions,
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
    data: posts,
    meta: {
      page: page,
      limit: limit,
      total: totalPostCount,
      totalPages: Math.ceil(totalPostCount / limit),
    },
  };
};

// get single post logic
const getPostById = async (postId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
        isPremium: false,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comment: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comment: true,
          },
        },
      },
    });
    return post;
  });
  return transactionResult;
};

// update post logic
const updatePost = async (
  postId: string,
  Payload: ICreatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Yout are not the owner of this post! ");
  }

  const resul = await prisma.post.update({
    where: {
      id: postId,
    },
    data: Payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comment: true,
    },
  });
};

// get author posts logic
const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comment: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comment: true,
        },
      },
    },
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findFirstOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post");
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
};

// admin Dashboard এর জন্য
const getPostStatus = async () => {
  const transacttionResult = await prisma.$transaction(async (tx) => {
    const [
      totalposts,
      total_comments,
      totalRejectComments,
      totalPublishedPost,
      totalDraftPost,
      totalApprovedComments,
      totalArchivedPost,
      totalpostviewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      // total---PublishedPost
      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      // total----DraftPost
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      // total---ArchivedPost
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      //  total_comments
      await tx.comment.count(),
      //  totalApprovedComments
      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      // totalRejectComments
      await tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),
      // totalpostviewsAggregate
      await tx.post.aggregate({
        _sum: { views: true },
      }),
      // total view
    ]);

    return {
      totalposts,
      total_comments,
      totalRejectComments,
      totalPublishedPost,
      totalDraftPost,
      totalApprovedComments,
      totalArchivedPost,
      totalpostviewsAggregate,
      totalPostViews: totalpostviewsAggregate._sum.views,
    };
  });
  return transacttionResult;
};

export const postService = {
  postCreate,
  getAllPosts,
  getPostStatus,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
