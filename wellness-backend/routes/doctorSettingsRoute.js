import { Router } from "express";
import {
    getDoctorSettings,
    updateDoctorProfileSettings,
    updateDoctorBusinessSettings,
    updateDoctorSecuritySettings,
} from "../controllers/doctorSettingsController.js";
import { isLogin } from "../middleWares/isLogin.js";

const router = Router();

// Get all doctor settings
router.get("/", isLogin, getDoctorSettings);

// Update profile settings
router.put("/profile", isLogin, updateDoctorProfileSettings);

// Update business settings
router.put("/business", isLogin, updateDoctorBusinessSettings);

// Update security settings
router.put("/security", isLogin, updateDoctorSecuritySettings);

export default router;
