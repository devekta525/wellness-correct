import { Router } from 'express';
import {
    getMyStats,
    getMyAppointments,
    getMyPrescriptions,
    downloadMyData,
    countCustomers
} from '../controllers/customerController.js';
import { isLogin } from '../middlewares/isLogin.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { isCustomer } from '../middlewares/isCustomer.js';

const router = Router();

router.use(isLogin);

// Customer-specific routes - customers can only view their own data
router.get('/stats', isCustomer, getMyStats);
router.get('/appointments', isCustomer, getMyAppointments);
router.get('/prescriptions', isCustomer, getMyPrescriptions);
router.get('/download-data', isCustomer, downloadMyData);

// Admin-only route for customer count
router.get('/admin/count', isAdmin, countCustomers);

export default router;