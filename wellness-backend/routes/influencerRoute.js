import { Router } from 'express';
import {
    createInfluencer,
    getAllInfluencers,
    getInfluencerById,
    toggleInfluencerStatus,
    updateInfluencer,
    countInfluencers
} from '../controllers/influencerController.js';
import { upload } from '../config/s3Config.js';
import { isLogin } from '../middleWares/isLogin.js';
import { isAdmin } from '../middleWares/isAdmin.js';

const router = Router();

// Admin routes - must be before :id routes to avoid conflicts
router.get('/admin/count', isLogin, isAdmin, countInfluencers);

// CRUD routes - Create, Update, Delete require Admin
router.post('/', isLogin, isAdmin, upload.single('imageUrl'), createInfluencer);
router.get('/', getAllInfluencers);
router.get('/:id', getInfluencerById);
router.put('/:id', isLogin, isAdmin, upload.single('imageUrl'), updateInfluencer);
router.get('/isactive/:id', isLogin, isAdmin, toggleInfluencerStatus);

export default router;
