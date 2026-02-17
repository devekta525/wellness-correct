import {Router} from "express"
import {  createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blogController.js"
import { isLogin } from "../middleWares/isLogin.js"

const router=Router()

// router.post("/bloggenerate",isLogin, blogGenerate)

router.post("/create",isLogin, createBlog)

router.get("/",isLogin, getAllBlogs)
router.get("/:id",isLogin, getBlogById)
router.put("/:id",isLogin, updateBlog)
router.delete("/:id",isLogin, deleteBlog)

export default router