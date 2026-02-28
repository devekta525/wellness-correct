import { Router } from "express";
import { countProducts, createProduct, deleteProduct, getAllProducts, getAllProductsForPublic, getProductById, getProductBySlug, getProductsByCategory, updateProduct, updateStock } from "../controllers/productsController.js";
import { upload } from "../config/s3Config.js";
import formParser from "../config/formParser.js";
import { isLogin } from "../middlewares/isLogin.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// only logged‑in admins can create/update/delete products
router.post('/', isLogin, isAdmin, formParser.none(), createProduct);

router.get('/', getAllProducts);

router.get('/public', getAllProductsForPublic);

router.get('/count', countProducts);

router.get('/category/:category', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);


router.get('/:id', getProductById);

router.put('/:id', isLogin, isAdmin, updateProduct);

router.delete('/:id', isLogin, isAdmin, deleteProduct);


router.patch('/:id/stock', isLogin, isAdmin, updateStock);


export default router