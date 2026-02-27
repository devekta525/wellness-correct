import { Router } from 'express';
import {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription,
    getPrescriptionStats,
    exportPrescriptions,
    getMyPrescriptions
} from '../controllers/prescriptionController.js';
import { isLogin } from '../middleWares/isLogin.js';
import { isDoctor } from '../middleWares/isDoctor.js';
import { isAdmin } from '../middleWares/isAdmin.js';

const router = Router();

// All routes below require a valid JWT
router.use(isLogin);

// Helper middleware for Doctor or Admin access
const isDoctorOrAdmin = (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
};

// ── Static / named routes (must come BEFORE /:id) ────────────────────────────
// Create, read all, stats, export - Doctor or Admin only
router.post('/', isDoctorOrAdmin, createPrescription);
router.get('/stats', isDoctorOrAdmin, getPrescriptionStats);
router.get('/export', isDoctorOrAdmin, exportPrescriptions);
// Get own prescriptions - authenticated user
router.get('/my', getMyPrescriptions);
router.get('/', isDoctorOrAdmin, getPrescriptions);

// ── Dynamic :id routes ────────────────────────────────────────────────────────
router.get('/:id', isDoctorOrAdmin, getPrescriptionById);
router.put('/:id', isDoctorOrAdmin, updatePrescription);
router.delete('/:id', isDoctorOrAdmin, deletePrescription);

export default router;
