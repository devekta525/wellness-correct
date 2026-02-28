import { Router } from 'express';
import {
    getOverviewReport,
    getAppointmentReport,
    getPatientReport,
    getPrescriptionReport,
    exportReport
} from '../controllers/reportController.js';
import { isLogin } from '../middlewares/isLogin.js';
import { isDoctor } from '../middlewares/isDoctor.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = Router();

router.use(isLogin);

// Report routes require Doctor or Admin access
const isDoctorOrAdmin = (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
};

router.get('/overview', isDoctorOrAdmin, getOverviewReport);
router.get('/appointments', isDoctorOrAdmin, getAppointmentReport);
router.get('/patients', isDoctorOrAdmin, getPatientReport);
router.get('/prescriptions', isDoctorOrAdmin, getPrescriptionReport);
router.get('/export', isDoctorOrAdmin, exportReport);

export default router;