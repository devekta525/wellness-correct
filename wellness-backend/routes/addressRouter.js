import { Router } from "express";
import { addAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress, upsertAddressDoc } from "../controllers/addressController.js";
import { isLogin } from "../middleWares/isLogin.js";


const router = Router();

// Document level
router.post('/', isLogin, upsertAddressDoc);                 // create/replace entire doc for a user
router.get('/user/:userId', isLogin, getAddresses);          // read addresses for user

// Address item level
router.post('/user/:userId', isLogin, addAddress);           // add one address
router.put('/user/:userId/:addressId', isLogin, updateAddress);      // update one address
router.delete('/user/:userId/:addressId', isLogin, deleteAddress);   // delete one address
router.patch('/user/:userId/:addressId/default', isLogin, setDefaultAddress); // set default

export default router;
