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
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

router.use(isLogin);

router.post('/', createPatient);
router.get('/', getPatients);
router.get('/stats', getPatientStats);
router.get('/count', getTotalPatientsCount);
router.get('/export', exportPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;