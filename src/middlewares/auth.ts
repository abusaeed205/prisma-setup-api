// import { NextFunction, Request, Response, Router } from "express";
// import httpStatus from "http-status";
// import { catchAsync } from "../utils/catchAsync";
// import { jwtUtils } from "../utils/jwt";
// import config from "../config";
// import { JwtPayload } from "jsonwebtoken";
// import { prisma } from "../lib/prisma";
// import { Role } from "../../generated/prisma/enums";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         email: string;
//         name: string;
//         id: string;
//         role: Role;
//       };
//     }
//   }
// }

// export const auth = (...requiredRoles: Role[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const token = req.cookies.accessToken
//       ? req.cookies.accessToken
//       : req.headers.authorization?.startsWith("Bearer")
//         ? req.headers.authorization?.split(" ")[1]
//         : req.headers.authorization;

//     if (!token) {
//       throw new Error(
//         "You are not logged in.please log in to access this resource.",
//       );
//     }

//     // verifiedToken এই ফাংশনটা utils এ আছে এখান থেকে শুধু ভেল্যু যাচ্ছে
//     const verifiedToken = jwtUtils.verifiedToken(
//       token,
//       config.jwt_access_secret,
//     );

//     if (!verifiedToken.success) {
//       throw new Error(verifiedToken.error);
//     }

//     const { email, name, id, role } = verifiedToken.data as JwtPayload;

//     if (requiredRoles.length && !requiredRoles.includes(role)) {
//       throw new Error(
//         "Forbidden.You don't Have permission to access this resource",
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: {
//         id,
//         email,
//         name,
//         role,
//       },
//     });

//     if (!user) {
//       throw new Error("User not found. please log in again");
//     }

//     if (user.activeStatus === "BLOCKED") {
//       throw new Error("Your account has been blocked.please contact support");
//     }

//     req.user = {
//       email,
//       name,
//       id,
//       role,
//     };
//     next();
//   });
// };

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";

// Express Request এর সাথে user property যোগ করা
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

// Role ভিত্তিক Authentication Middleware
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Cookie অথবা Authorization Header থেকে Token নেওয়া
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1] // Bearer xxx থেকে শুধু token নেওয়া
        : req.headers.authorization;

    // Token না থাকলে Login করতে বলবে
    if (!token) {
      throw new Error(
        "You are not logged in. Please log in to access this resource.",
      );
    }

    // Token Verify করা
    const verifiedToken = jwtUtils.verifiedToken(
      token,
      config.jwt_access_secret,
    );

    // Token Invalid হলে Error দিবে
    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    // Token থেকে User Information বের করা
    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    // User এর Role অনুমোদিত কিনা চেক করা
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden. You don't have permission to access this resource",
      );
    }

    // Database এ User এখনও আছে কিনা চেক করা
    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    // User না থাকলে Error
    if (!user) {
      throw new Error("User not found. Please log in again");
    }

    // User Blocked হলে Access বন্ধ
    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked. Please contact support");
    }

    // পরবর্তী Middleware/Controller এর জন্য User তথ্য Request এ রাখা
    req.user = {
      email,
      name,
      id,
      role,
    };

    // সব ঠিক থাকলে পরবর্তী Middleware/Controller এ যাওয়া
    next();
  });
};
