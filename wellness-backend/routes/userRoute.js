import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTotalUsersCount,
  updateUserProfile,
} from "../controllers/userController.js";
import { createDoctor, getAllDoctors, getDoctorById, toggleDoctorStatus, updateDoctor, countDoctors } from "../controllers/doctorUserController.js";
import { createInfluencer, getAllInfluencers, getInfluencerById, toggleInfluencerStatus, updateInfluencer, countInfluencers } from "../controllers/influencerController.js";
import { countCustomers } from "../controllers/customerController.js";
import { upload } from "../config/s3Config.js";
import { isLogin } from "../middleWares/isLogin.js";
import { isAdmin } from "../middleWares/isAdmin.js";

const router = Router();

// General user routes - admin only
router.post("/", isLogin, isAdmin, upload.single("imageUrl"), createUser);
router.get("/", isLogin, isAdmin, getUsers);
router.get("/count", isLogin, isAdmin, getTotalUsersCount);
router.get("/customer/admin/count", isLogin, isAdmin, countCustomers);
router.patch("/update-profile", isLogin, upload.single("image"), updateUserProfile);
router.get("/:id", isLogin, getUserById);
router.patch("/:id", isLogin, isAdmin, upload.single("imageUrl"), updateUser);
router.delete("/:id", isLogin, isAdmin, deleteUser);

// Doctor routes - admin only for CRUD
router.post("/doctor", isLogin, isAdmin, createDoctor);
router.get("/doctor", getAllDoctors);
router.get("/doctor/admin/count", isLogin, isAdmin, countDoctors);
router.get("/doctor/:id", getDoctorById);
router.put("/doctor/:id", isLogin, isAdmin, updateDoctor);
router.get("/doctor/isactive/:id", isLogin, isAdmin, toggleDoctorStatus);

// Influencer routes - admin only for CRUD
router.post("/influencer", isLogin, isAdmin, createInfluencer);
router.get("/influencer", getAllInfluencers);
router.get("/influencer/admin/count", isLogin, isAdmin, countInfluencers);
router.get("/influencer/:id", getInfluencerById);
router.put("/influencer/:id", isLogin, isAdmin, updateInfluencer);
router.get("/influencer/isactive/:id", isLogin, isAdmin, toggleInfluencerStatus);

export default router;
