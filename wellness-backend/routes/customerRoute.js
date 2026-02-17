import { Router } from 'express';
import {
    getMyStats,
    getMyAppointments,
    getMyPrescriptions,
    downloadMyData,
    countCustomers
} from '../controllers/customerController.js';
import { isLogin } from '../middleWares/isLogin.js';
import { isAdmin } from '../middleWares/isAdmin.js';

const router = Router();

router.use(isLogin);

router.get('/stats', getMyStats);
router.get('/appointments', getMyAppointments);
router.get('/prescriptions', getMyPrescriptions);
router.get('/download-data', downloadMyData);
router.get('/admin/count', isAdmin, countCustomers);

export default router;