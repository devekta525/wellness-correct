import { Router } from "express";
import { countProducts, createProduct, deleteProduct, getAllProducts, getAllProductsForPublic, getProductById, getProductBySlug, getProductsByCategory, updateProduct, updateStock } from "../controllers/productsController.js";
import { upload } from "../config/s3Config.js";
import formParser from "../config/formParser.js";

const router = Router();

router.post('/', formParser.none(), createProduct);

router.get('/', getAllProducts);

router.get('/public', getAllProductsForPublic)

router.get('/count', countProducts);

router.get('/category/:category', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);


router.get('/:id', getProductById);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);


router.patch('/:id/stock', updateStock);


export default router