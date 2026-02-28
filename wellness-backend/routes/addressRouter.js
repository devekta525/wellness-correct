import { Router } from "express";
import { addAddress, deleteAddress, getAddress, setDefaultAddress, updateAddress, upsertAddressDoc } from "../controllers/addressController.js";
import { isLogin } from "../middlewares/isLogin.js";


const router = Router();

// All routes below are for the authenticated user and require a valid JWT.
// The 'isLogin' middleware ensures req.user is populated.
router.use(isLogin);

// Get all addresses for the logged-in user
router.get('/my', getAddress);

// Add a new address for the logged-in user
router.post('/add', addAddress);

// Update a specific address by its ID
router.put('/:addressId', updateAddress);

// Delete a specific address by its ID
router.delete('/:addressId', deleteAddress);

// Set a specific address as the default
router.patch('/:addressId/default', setDefaultAddress);

// Create or replace the entire address document for the logged-in user
router.post('/', upsertAddressDoc);

export default router;
