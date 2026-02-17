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
    getUserOrdersCount
} from "../controllers/orderController.js";
import { isLogin } from "../middleWares/isLogin.js";
import { isAdmin } from "../middleWares/isAdmin.js";

const router = Router();

router.post('/', isLogin, createOrder);

router.get('/user/my-orders', isLogin, getUserOrders);

router.get('/user/my-orders/count', isLogin, getUserOrdersCount);

router.get('/admin/count', isLogin, isAdmin, countOrders);

router.get('/admin/users-with-orders', isLogin, isAdmin, getUsersWithOrders);

router.get('/', isLogin, listOrders);

router.get('/:id', isLogin, getOrderById);

router.put('/:id', isLogin, isAdmin, updateOrder);

router.delete('/:id', isLogin, isAdmin, deleteOrder);

export default router;
