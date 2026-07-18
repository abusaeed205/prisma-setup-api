import { Router } from "express";
import { subscriptionController } from "./subsCription.cotroller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/checkout",
  auth(Role.USER, Role.AUTHOR, Role.ADMIN),
  subscriptionController.createCheckOutSession,
);

// handel webhook এটার মাধ্যমে লেনদেন এর তথ্য গুলো ডাটাবেইজে জমা হবে
router.post("/webhook", subscriptionController.hondelwebhook);
router.get(
  "/status",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  subscriptionController.getSubscriptionStatus,
);

export const scriptionsRouter = router;
