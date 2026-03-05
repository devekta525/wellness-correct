import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import { upload } from "../config/s3Config.js";
import { isLogin } from "../middleware/isLogin.js";
import { isAdmin } from "../middleware/isAdmin.js";


const router = Router();

router.post("/", upload.single('imageUrl'), isLogin, isAdmin, createCategory);
router.get("/", isLogin, getCategories);
router.get("/:id", isLogin, getCategoryById);
router.put("/:id", upload.single('imageUrl'), isLogin, isAdmin, updateCategory);
router.delete("/:id", isLogin, isAdmin, deleteCategory);

export default router;
