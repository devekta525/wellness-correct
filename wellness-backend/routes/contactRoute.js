import { Router } from "express";
import { 
    createContact, 
    getAllContacts, 
    getContactById, 
    updateContact, 
    deleteContact,
    countContacts
} from "../controllers/contactController.js";
import { isLogin } from "../middlewares/isLogin.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// This route should be before /:id to avoid conflicts
router.get('/admin/count', isLogin, isAdmin, countContacts);

router.post('/', createContact);
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
