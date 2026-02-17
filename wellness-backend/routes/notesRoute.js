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
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

router.use(isLogin);

router.post('/', createNote);
router.get('/stats', getNoteStats);
router.get('/export', exportNotes);
router.get('/', listNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/favorite', toggleFavoriteNote);

export default router;