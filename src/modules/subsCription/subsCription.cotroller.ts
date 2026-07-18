import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subsCriptionService } from "./subsCription.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckOutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subsCriptionService.createCheckOutSession(
      userId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout Completed Successfully",
      data: result,
    });
  },
);

// handel webhook এটার মাধ্যমে লেনদেন এর তথ্য গুলো ডাটাবেইজে জমা হবে
const hondelwebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"]!;

    await subsCriptionService.handleWebhook(event, signature as string);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Webhook triggered successfully",
      data: null,
    });
  },
);

const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const result = await subsCriptionService.getSubscriptionStatus(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Subscription status retrieved successfully",
      data: result,
    });
  },
);

export const subscriptionController = {
  createCheckOutSession,
  hondelwebhook,
  getSubscriptionStatus,
};
