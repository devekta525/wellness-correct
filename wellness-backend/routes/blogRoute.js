import { Router } from "express"
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blogController.js"
import { isLogin } from "../middlewares/isLogin.js"
import { isAdmin } from "../middlewares/isAdmin.js"

const router = Router()

// router.post("/bloggenerate",isLogin, blogGenerate)

router.post("/create", isLogin, isAdmin, createBlog)

router.get("/", isLogin, getAllBlogs)
router.get("/:id", isLogin, getBlogById)
router.put("/:id", isLogin, isAdmin, updateBlog)
router.delete("/:id", isLogin, isAdmin, deleteBlog)

export default router