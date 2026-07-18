import { Router } from "express";
import { premiumController } from "./premium.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { subscribtionGard } from "../../middlewares/premimGard";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscribtionGard(),
  premiumController.getPremiumContent,
);

export const premiumRoutes = router;
