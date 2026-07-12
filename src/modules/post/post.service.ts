import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { Payload } from "./../../../generated/prisma/internal/prismaNamespace";
import { ICreatePostPayload } from "./post.interface";

const postCreate = async (Payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...Payload,
      authorId: userId,
    },
  });

  return result;
};

// get all posts logic

const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
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
  return posts;
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
