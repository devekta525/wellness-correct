import { Router } from "express"
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog, getPublishedBlogs, getBlogBySlug } from "../controllers/blogController.js"
import { isLogin } from "../middleware/isLogin.js"
import { isAdmin } from "../middleware/isAdmin.js"

const router = Router()

// Public routes
router.get("/published", getPublishedBlogs);
router.get("/public/:slug", getBlogBySlug);

// Admin routes (protected)
router.post("/create", isLogin, isAdmin, createBlog)
router.get("/", isLogin, getAllBlogs)
router.get("/:id", isLogin, getBlogById)
router.put("/:id", isLogin, isAdmin, updateBlog)
router.delete("/:id", isLogin, isAdmin, deleteBlog)

export default router