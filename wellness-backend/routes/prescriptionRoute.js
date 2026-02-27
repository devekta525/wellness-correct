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

const router = Router();

// All routes below require a valid JWT
router.use(isLogin); // This acts as the 'protect' middleware for all routes in this file.

// ── Static / named routes (must come BEFORE /:id) ────────────────────────────
router.post('/', createPrescription);
router.get('/stats', getPrescriptionStats);
router.get('/export', exportPrescriptions);
router.get('/my', getMyPrescriptions); // Securely get prescriptions for the logged-in user. The 'isPatient' role guard is removed as requested.
router.get('/', getPrescriptions);

// ── Dynamic :id routes ────────────────────────────────────────────────────────
router.get('/:id', getPrescriptionById);
router.put('/:id', updatePrescription);
router.delete('/:id', deletePrescription);

export default router;
