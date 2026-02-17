import { Router } from "express";
import { createCoupon, deleteCoupon, getCouponById, listCoupons, redeem, setCouponStatus, updateCoupon, validateAndApply } from "../controllers/couponController.js";



const router = Router();

// CRUD
router.post('/', createCoupon);
router.get('/', listCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

// Status toggle
router.patch('/:id/status', setCouponStatus);

// Validation/apply and usage tracking
router.post('/validate', validateAndApply);   // body: { code, userId?, orderAmount }
router.post('/redeem', redeem);

export default router;
