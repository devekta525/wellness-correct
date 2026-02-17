import { Router } from 'express';
import {
  createPopup,
  listPopups,
  getPopupById,
  updatePopup,
  deletePopup,
  togglePopupStatus
} from '../controllers/popupController.js';
import { upload } from '../config/s3Config.js';

const router = Router();

// CRUD endpoints
router.post('/', upload.single('image'), createPopup);
router.get('/', listPopups);
router.get('/:id', getPopupById);
router.put('/:id', updatePopup);
router.delete('/:id', deletePopup);

// Status toggle
router.patch('/:id/status', togglePopupStatus);

export default router;
