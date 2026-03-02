import { Router } from 'express';
import {
    addPaymentMethod,
    getPaymentMethods,
    deletePaymentMethod,
    setDefaultPaymentMethod
} from '../controllers/paymentMethodController.js';
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

router.use(isLogin);

router.post('/', addPaymentMethod);
router.get('/', getPaymentMethods);
router.delete('/:methodId', deletePaymentMethod);
router.patch('/:methodId/default', setDefaultPaymentMethod);

export default router;