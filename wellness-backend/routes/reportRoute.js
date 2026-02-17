import { Router } from 'express';
import {
    getOverviewReport,
    getAppointmentReport,
    getPatientReport,
    getPrescriptionReport,
    exportReport
} from '../controllers/reportController.js';
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

router.use(isLogin);

router.get('/overview', getOverviewReport);
router.get('/appointments', getAppointmentReport);
router.get('/patients', getPatientReport);
router.get('/prescriptions', getPrescriptionReport);
router.get('/export', exportReport);

export default router;