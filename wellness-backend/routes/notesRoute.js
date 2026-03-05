import { Router } from 'express';
import {
    createNote,
    listNotes,
    getNoteById,
    updateNote,
    deleteNote,
    toggleFavoriteNote,
    getNoteStats,
    exportNotes
} from '../controllers/notesController.js';
import { isLogin } from '../middleware/isLogin.js';
import { isDoctor } from '../middleware/isDoctor.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = Router();

router.use(isLogin);

// Doctor notes require Doctor or Admin access
const isDoctorOrAdmin = (req, res, next) => {
    if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
};

router.post('/', isDoctorOrAdmin, createNote);
router.get('/stats', isDoctorOrAdmin, getNoteStats);
router.get('/export', isDoctorOrAdmin, exportNotes);
router.get('/', isDoctorOrAdmin, listNotes);
router.get('/:id', isDoctorOrAdmin, getNoteById);
router.put('/:id', isDoctorOrAdmin, updateNote);
router.delete('/:id', isDoctorOrAdmin, deleteNote);
router.patch('/:id/favorite', isDoctorOrAdmin, toggleFavoriteNote);

export default router;