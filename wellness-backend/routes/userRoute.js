import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTotalUsersCount,
} from "../controllers/userController.js";
import { createDoctor, getAllDoctors, getDoctorById, toggleDoctorStatus, updateDoctor, countDoctors } from "../controllers/doctorUserController.js";
import { createInfluencer, getAllInfluencers, getInfluencerById, toggleInfluencerStatus, updateInfluencer, countInfluencers } from "../controllers/influencerController.js";
import { countCustomers } from "../controllers/customerController.js";
import { upload } from "../config/s3Config.js";
import { isLogin } from "../middleWares/isLogin.js";
import { isAdmin } from "../middleWares/isAdmin.js";

const router = Router();

// Routes
router.post("/", upload.single("imageUrl"), createUser);          // Create user
router.get("/", getUsers);             // Get all users
router.get("/count",getTotalUsersCount)
router.get("/customer/admin/count", isLogin, isAdmin, countCustomers);
router.get("/:id", getUserById);       // Get user by ID
router.put("/:id", upload.single("imageUrl"), updateUser);        // Update user
router.delete("/:id", deleteUser);     // Delete user


router.post("/doctor", createDoctor);          // Create user
router.get("/doctor", getAllDoctors);             // Get all users
router.get("/doctor/admin/count", isLogin, isAdmin, countDoctors);
router.get("/doctor/:id", getDoctorById);       // Get user by ID
router.put("/doctor/:id", updateDoctor);        // Update user
router.get("/doctor/isactive/:id", toggleDoctorStatus);



router.post("/influencer", createInfluencer);          // Create user
router.get("/influencer", getAllInfluencers);             // Get all users
router.get("/influencer/admin/count", isLogin, isAdmin, countInfluencers);
router.get("/influencer/:id", getInfluencerById);       // Get user by ID
router.put("/influencer/:id", updateInfluencer);        // Update user
router.get("/influencer/isactive/:id", toggleInfluencerStatus);


export default router;
