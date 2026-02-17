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

// CRUD routes
router.post('/', upload.single('imageUrl'), createInfluencer);
router.get('/', getAllInfluencers);
router.get('/:id', getInfluencerById);
router.put('/:id', upload.single('imageUrl'), updateInfluencer);
router.get('/isactive/:id', toggleInfluencerStatus);

export default router;
