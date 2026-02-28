import { Router } from 'express';
import {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    toggleDoctorStatus,
    updateDoctor,
    countDoctors
} from '../controllers/doctorUserController.js';
import { upload } from '../config/s3Config.js';
import { isLogin } from '../middlewares/isLogin.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = Router();

// Admin routes - must be before :id routes to avoid conflicts
router.get('/admin/count', isLogin, isAdmin, countDoctors);

// CRUD routes - Create, Update, Delete require Admin
router.post('/', isLogin, isAdmin, upload.single('imageUrl'), createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', isLogin, isAdmin, upload.single('imageUrl'), updateDoctor);
router.get('/isactive/:id', isLogin, isAdmin, toggleDoctorStatus);

export default router;
