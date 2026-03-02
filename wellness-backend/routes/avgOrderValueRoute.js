import express from 'express';
import { isLogin } from '../middleWares/isLogin.js';
import { getAvgOrderValue } from '../controllers/avgOrderValueController.js';

const router = express.Router();

router.get('/avg-order-value', isLogin, getAvgOrderValue);

export default router;