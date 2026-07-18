import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./config";

import { userRouters } from "./modules/users/users.router";
import { authRouter } from "./modules/auth/auth.route";
import { postRouter } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.router";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/golobalErrorHandler";
import { scriptionsRouter } from "./modules/subsCription/subsCription.route";
import { premiumRoutes } from "./modules/premium/premium.route";

const app: Application = express();

// webhook এটার সাহায্য ডাটা বেইজে লেনদেন এর তথ্য গুলো জমা রাখা হয়
// package.json ফাইলে"stripe:webhook" একটি url যুৃক্ত করা আছে তার পর, ‍server চালু থাকা অবস্থায় এটা Run করে  npm run stripe:webhook টারমিনাল থেকে Whsec  সিকরেট কোড কপি করে  .env file এ রাখবো (Interactive webhook endpoint builder)
// strip:1/2
app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello,world");
});

app.use("/api/user", userRouters);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRoutes);
// strip:2/2
app.use("/api/subscription", scriptionsRouter);
app.use("/api/premium", premiumRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
