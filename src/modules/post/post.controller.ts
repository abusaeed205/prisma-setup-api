import { NextFunction, Request, response, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const postCreate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    const Payload = req.body;

    const result = await postService.postCreate(Payload, id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "post Created Successfully",
      data: result,
    });
  },
);

const getAllPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await postService.getAllPosts(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Posts Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post Id Required In Params");
    }

    const result = await postService.getPostById(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post retrieved successfuly",
      data: result,
    });
  },
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;

    const result = await postService.getMyPosts(authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "my Post retrieved successfuly",
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const postId = req.params.postId;
    const Payload = req.body;

    if (!postId) {
      throw new Error("Post Id Required In Params");
    }

    const result = await postService.updatePost(
      postId as string,
      Payload,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "post update successfully",
      data: result,
    });
  },
);

const getPostStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getPostStatus();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "post status retrieve successfully",
      data: result,
    });
  },
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post Id Required In Params");
    }

    await postService.deletePost(postId as string, authorId as string, isAdmin);
    sendResponse(res, {
      success: true,
      message: "User delete successfully",
      statusCode: httpStatus.OK,
      data: null,
    });
  },
);

// export
export const postController = {
  postCreate,
  getAllPost,
  getPostStatus,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
