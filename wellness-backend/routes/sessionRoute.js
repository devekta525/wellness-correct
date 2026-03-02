import { Router } from 'express';
import {
  getAllSessionsByUserId,
  deleteAllSessionsByUserId,
  deleteOneSessionByUserId
} from '../controllers/sessionController.js';
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

// Get all sessions for a user
router.get('/user/',isLogin, getAllSessionsByUserId);

// Delete all sessions for a user
router.delete('/user/',isLogin, deleteAllSessionsByUserId);

// Delete one specific session for a user
router.delete('/user/session/:sessionId',isLogin, deleteOneSessionByUserId);

export default router;
