import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { postController } from "./post.controller";

const route = Router();

route.post(
  "/",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  postController.postCreate,
);

route.get("/", postController.getAllPost);
// ------------------------GET POST STATUS --------------------
route.get("/stats", auth(Role.ADMIN), postController.getPostStatus);
//------------------------- GET MY POST ----------------------
route.get(
  "/my-posts",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  postController.getMyPosts,
);
// ----------------------GET BY ID POST --------------------
route.get("/:postId", postController.getPostById);
// --------------------------PATCH -------------------------
route.patch(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.updatePost,
);
// -----------------------------DELETE -----------------------------
route.delete(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.deletePost,
);

export const postRouter = route;
