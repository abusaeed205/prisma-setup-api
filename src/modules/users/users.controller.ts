import { Payload } from "./../../../generated/prisma/internal/prismaNamespace";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { userServices } from "./users.service";
import { NextFunction } from "express-serve-static-core";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
// catchAsync হলো utils এর রাখা try catch ফাংশন
const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userServices.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User register Successfully",
      data: { user },
    });
  },
);

//------------------------------------ token-------------------------------
// cookies এর মাধ্যমে user Token চেক করে তার প্রফাইলে পাঠানো হচ্ছে
// token গুলো auth controllerr থেকে আসতেছে

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const { accessToken } = req.cookies;
    // console.log(req.user, "user Reques");

    const profile = await userServices.getMyProfileServicefromBD(
      req.user?.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "user Profile fetched successfully",
      data: { profile },
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const Payload = req.body;
    const updatedprofile = await userServices.updateMyProfileService(
      userId,
      Payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile updated Successfully",
      data: undefined,
    });
  },
);

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
};
