import bcrypt from "bcrypt";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./user.interface";


const registerUserIntoDB = async (payload:RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds)
  );

  // Create User & Profile in a Transaction
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await tx.profile.create({
      data: {
        userId: createdUser.id,
        profilePhoto,
      },
    });

    return await tx.user.findUnique({
      where: {
        id: createdUser.id,
      },
      omit: {
        password: true,
      },
      include: {
        profile: true,
      },
    });
  });

  return user;
};

export const userServices = {
  registerUserIntoDB,
};