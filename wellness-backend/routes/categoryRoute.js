import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import { upload } from "../config/s3Config.js";
import { isLogin } from "../middleWares/isLogin.js";


const router = Router();

router.post("/", upload.single('imageUrl'), isLogin, createCategory);
router.get("/", isLogin, getCategories);
router.get("/:id", isLogin, getCategoryById);
router.put("/:id", upload.single('imageUrl'), isLogin, updateCategory);
router.delete("/:id", isLogin, deleteCategory);

export default router;
