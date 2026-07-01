import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { NextFunction } from "express-serve-static-core";



export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            console.error(error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to Register user",
                error: (error as Error).message || "Failed to register user",
            });
        }
    }
}