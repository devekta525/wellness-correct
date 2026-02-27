import { Router } from 'express';
import { getDoctorDashboardData } from '../controllers/dashboardController.js';
import { isLogin } from '../middleWares/isLogin.js';
import { isDoctor } from '../middleWares/isDoctor.js';
import { isAdmin } from '../middleWares/isAdmin.js';

const router = Router();

router.use(isLogin);

// Doctor dashboard requires Doctor or Admin role
const isDoctorOrAdmin = (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
};

router.get('/doctor', isDoctorOrAdmin, getDoctorDashboardData);

export default router;