import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { SubsCriptionStatus } from "../../generated/prisma/enums";

export const subscribtionGard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const subsCription = await prisma.subsCription.findUnique({
      where: {
        userId,
      },
    });

    if (!subsCription) {
      throw new Error("please subscribe to get access to premium contents");
    }

    if (subsCription?.status !== SubsCriptionStatus.ACTIVE) {
      throw new Error("You subscribe again to get access to premium content");
    }
    next();
  });
};
