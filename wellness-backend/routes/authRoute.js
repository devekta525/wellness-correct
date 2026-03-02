import { Router } from "express";
import { check, login, logout, resetPassword, signup } from "../controllers/authController.js";
import { isLogin } from "../middleWares/isLogin.js";

const router=Router()

router.post("/login",login)
router.post("/check",isLogin ,check)
router.post("/logout",isLogin,logout)
router.post("/resetpassword",isLogin,resetPassword)
router.post("/register", signup)



export default router