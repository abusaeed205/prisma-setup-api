// import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// const createToken = (
//   payload: JwtPayload,
//   secret: string,
//   expiresIn: SignOptions["expiresIn"],
// ) => {
//   return jwt.sign(payload, secret, {
//     expiresIn,
//   });
// };

// // verify token
// // এখানে user.service থেকে ভেল্যু আসতেছে
// const verifiedToken = (token: string, secret: string) => {
//   try {
//     const verifiedToken = jwt.verify(token, secret);
//     return {
//       success: true,
//       data: verifiedToken,
//     };
//   } catch (error: any) {
//     console.log("Token verification failed", error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };

// export const jwtUtils = {
//   createToken,
//   verifiedToken,
// };

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  // JWT Token তৈরি করে Return করছে
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

// =======================
// Verify JWT Token
// =======================

// token  -> Client থেকে আসা Token
// secret -> একই Secret Key যেটা দিয়ে Token তৈরি হয়েছিল

const verifiedToken = (token: string, secret: string) => {
  try {
    // Token Verify করছে
    // Token ঠিক থাকলে এর ভিতরের Data Return করবে
    const verifiedToken = jwt.verify(token, secret);

    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    // Token Invalid / Expired হলে এখানে আসবে
    console.log("Token verification failed", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// অন্য File থেকে ব্যবহার করার জন্য Export
export const jwtUtils = {
  createToken,
  verifiedToken,
};
