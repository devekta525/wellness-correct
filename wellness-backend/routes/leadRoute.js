import express from 'express';
import { createLead, deleteLead, getLeadById, listLeads, touchLastContact, updateLead, updateLeadStatus } from '../controllers/leadController.js';


const router = express.Router();

// Collection
router.post('/', createLead);
router.get('/', listLeads);

// Item
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

// Partial updates
router.patch('/:id/status', updateLeadStatus);
router.patch('/:id/last-contact', touchLastContact);

export default router;
