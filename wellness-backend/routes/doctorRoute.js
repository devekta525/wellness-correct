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
import { isLogin } from '../middleWares/isLogin.js';
import { isAdmin } from '../middleWares/isAdmin.js';

const router = Router();

// Admin routes - must be before :id routes to avoid conflicts
router.get('/admin/count', isLogin, isAdmin, countDoctors);

// CRUD routes
router.post('/', upload.single('imageUrl'), createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', upload.single('imageUrl'), updateDoctor);
router.get('/isactive/:id', toggleDoctorStatus);

export default router;
