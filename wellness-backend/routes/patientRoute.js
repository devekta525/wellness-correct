import { Router } from 'express';
import {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientStats,
    getTotalPatientsCount,
    exportPatients
} from '../controllers/patientController.js';
import { isLogin } from '../middleware/isLogin.js';
import { isDoctor } from '../middleware/isDoctor.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = Router();

router.use(isLogin);

// Inline middleware for Doctor or Admin access
const isDoctorOrAdmin = (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
};

// All patient routes require Doctor or Admin
router.post('/', isDoctorOrAdmin, createPatient);
router.get('/', isDoctorOrAdmin, getPatients);
router.get('/stats', isDoctorOrAdmin, getPatientStats);
router.get('/count', isDoctorOrAdmin, getTotalPatientsCount);
router.get('/export', isDoctorOrAdmin, exportPatients);
router.get('/:id', isDoctorOrAdmin, getPatientById);
router.put('/:id', isDoctorOrAdmin, updatePatient);
router.delete('/:id', isDoctorOrAdmin, deletePatient);

export default router;