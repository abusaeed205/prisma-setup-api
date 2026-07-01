import { Router } from "express";
import { autController } from "./auth.controller";


const router=Router()

router.post("/login",autController.loginUser)


export const authRouter=router