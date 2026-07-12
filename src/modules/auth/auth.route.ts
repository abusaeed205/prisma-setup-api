import { Router } from "express";
import { autController } from "./auth.controller";

const router = Router();

router.post("/login", autController.loginUser);
router.post("/refresh-token", autController.refreshToken);

export const authRouter = router;
