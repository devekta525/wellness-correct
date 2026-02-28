import { Router } from "express";
import {
    countOrders,
    createOrder,
    deleteOrder,
    getOrderById,
    listOrders,
    updateOrder,
    getUserOrders,
    getUsersWithOrders,
    getUserOrdersCount,
    getUserNotifications,
} from "../controllers/orderController.js";
import { getAvgOrderValue } from "../controllers/avgOrderValueController.js";
import { isLogin } from "../middlewares/isLogin.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

router.post('/', isLogin, createOrder);

router.get('/user/my-orders', isLogin, getUserOrders);

router.get('/user/my-orders/count', isLogin, getUserOrdersCount);

router.get('/user/notifications', isLogin, getUserNotifications);

// GET /api/v1/orders/avg-order-value
router.get('/avg-order-value', isLogin, getAvgOrderValue);

router.get('/admin/count', isLogin, isAdmin, countOrders);

router.get('/admin/users-with-orders', isLogin, isAdmin, getUsersWithOrders);

router.get('/', isLogin, listOrders);

router.get('/:id', isLogin, getOrderById);

router.put('/:id', isLogin, isAdmin, updateOrder);

router.delete('/:id', isLogin, isAdmin, deleteOrder);

export default router;
