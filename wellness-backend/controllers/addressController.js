import mongoose from 'mongoose';
import Address from '../models/addressModel.js';


const isId = (id) => mongoose.isValidObjectId(id);

function validateAddressPayload(addr) {
  const required = ['name', 'address', 'state', 'city', 'pinCode'];
  for (const k of required) {
    if (!addr?.[k]) return `Field '${k}' is required`;
  }
  if (addr.addressType === 'Other' && !addr.addressLabel) {
    return 'addressLabel is required when addressType is Other';
  }
  return null;
}

// Create or replace full document for a user
export async function upsertAddressDoc(req, res) {
  try {
    const { user, addresses = [] } = req.body;
    if (!isId(user)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    // validations
    for (const a of addresses) {
      const err = validateAddressPayload(a);
      if (err) return res.status(400).json({ success: false, message: err });
    }
    // ensure single default
    if (addresses.filter(a => a.isDefault).length > 1) {
      return res.status(400).json({ success: false, message: 'Only one default address allowed' });
    }

    const doc = await Address.findOneAndUpdate(
      { user },
      { user, addresses },
      { upsert: true, new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

// Get by user
export async function getAddresses(req, res) {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const doc = await Address.findOne({ user: userId }).populate('user', 'firstName lastName email');
    res.json({ success: true, data: doc || { user: userId, addresses: [] } });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

// Add one address
export async function addAddress(req, res) {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const addr = req.body;
    const err = validateAddressPayload(addr);
    if (err) return res.status(400).json({ success: false, message: err });

    let doc = await Address.findOne({ user: userId });
    if (!doc) {
      doc = await Address.create({ user: userId, addresses: [] });
    }

    if (addr.isDefault) {
      doc.addresses.forEach(a => { a.isDefault = false; });
    }

    doc.addresses.push(addr);
    await doc.save();

    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

// Update one address
export async function updateAddress(req, res) {
  try {
    const { userId, addressId } = req.params;
    if (!isId(userId) || !isId(addressId)) {
      return res.status(400).json({ success: false, message: 'Invalid ids' });
    }

    const updates = req.body;
    if (updates.addressType === 'Other' && !updates.addressLabel) {
      return res.status(400).json({ success: false, message: 'addressLabel is required when addressType is Other' });
    }

    const doc = await Address.findOne({ user: userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Address document not found' });

    const sub = doc.addresses.id(addressId);
    if (!sub) return res.status(404).json({ success: false, message: 'Address not found' });

    if (updates.isDefault === true) {
      doc.addresses.forEach(a => { a.isDefault = false; });
    }

    Object.assign(sub, updates);
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

// Delete one address
export async function deleteAddress(req, res) {
  try {
    const { userId, addressId } = req.params;
    if (!isId(userId) || !isId(addressId)) {
      return res.status(400).json({ success: false, message: 'Invalid ids' });
    }

    const doc = await Address.findOne({ user: userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Address document not found' });

    const sub = doc.addresses.id(addressId);
    if (!sub) return res.status(404).json({ success: false, message: 'Address not found' });

    sub.deleteOne();
    await doc.save();

    res.json({ success: true, message: 'Address removed', data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}

// Set default explicitly
export async function setDefaultAddress(req, res) {
  try {
    const { userId, addressId } = req.params;
    if (!isId(userId) || !isId(addressId)) {
      return res.status(400).json({ success: false, message: 'Invalid ids' });
    }

    const doc = await Address.findOne({ user: userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Address document not found' });

    doc.addresses.forEach(a => { a.isDefault = a._id.toString() === addressId; });
    await doc.save();

    res.json({ success: true, message: 'Default address updated', data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}
