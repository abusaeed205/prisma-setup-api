import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { userServices } from "./users.service";
import { NextFunction } from "express-serve-static-core";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";




const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body
    const user = await userServices.registerUserIntoDB(payload)
   
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.CREATED,
        message:"User register Successfully",
        data:{user}
    })
})





// const registerUser = async (req: Request, res: Response) => {
//     try {
//         const payload = req.body;

//         const user = await userServices.registerUserIntoDB(payload);

//         res.status(httpStatus.CREATED).json({
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "User registered successfully",
//             data: user,
//         });
//     } 
// };

export const userController = {
    registerUser,
};