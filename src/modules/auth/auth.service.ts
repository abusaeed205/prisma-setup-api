import { prisma } from "../../lib/prisma"
import { IloginUser } from "./auth.Interface"
import bcrypt from "bcrypt"
import config from "../../config"
import { jwtUtils } from "../../utils/jwt"
import { SignOptions } from "jsonwebtoken"

const loginUser = async (payload: IloginUser) => {
    const { email, password } = payload

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        throw new Error("Password is incorrect")
    }


    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name

    }



    // access token 
    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions["expiresIn"]
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions["expiresIn"]
    );
    return {
        accessToken,
        refreshToken
    }
}

export const authService = {
    loginUser
}