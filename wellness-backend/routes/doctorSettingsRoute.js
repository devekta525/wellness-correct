import { Router } from "express";
import {
    getDoctorSettings,
    updateDoctorProfileSettings,
    updateDoctorBusinessSettings,
    updateDoctorSecuritySettings,
} from "../controllers/doctorSettingsController.js";
import { isLogin } from "../middlewares/isLogin.js";
import { isDoctor } from "../middlewares/isDoctor.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// All doctor settings routes require doctor or admin role
router.use(isLogin);

// Get all doctor settings (Doctor or Admin)
router.get("/", (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, getDoctorSettings);

// Update settings (Doctor or Admin only)
router.put("/profile", (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, updateDoctorProfileSettings);

router.put("/business", (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, updateDoctorBusinessSettings);

router.put("/security", (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, updateDoctorSecuritySettings);

export default router;
