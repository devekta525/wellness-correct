import { Router } from 'express';
import { getDoctorDashboardData } from '../controllers/dashboardController.js';
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

router.use(isLogin);

router.get('/doctor', getDoctorDashboardData);

export default router;