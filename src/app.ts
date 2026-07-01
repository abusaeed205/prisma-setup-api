import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import  httpStatus  from "http-status";
import { prisma } from "./lib/prisma";

import { userRouters } from "./modules/users/users.router";
import { authRouter } from "./modules/auth/auth.route";

const app: Application = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: config.app_url,
    credentials: true
}))

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello,world")
})


app.use("/api/user",userRouters)
app.use("/api/auth",authRouter)

export default app