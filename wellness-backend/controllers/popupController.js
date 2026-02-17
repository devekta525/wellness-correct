import mongoose from 'mongoose';
import Popup from '../models/popupModel.js';
import { uploadToS3 } from '../config/s3Config.js';


const isId = (id) => mongoose.isValidObjectId(id);

// CREATE
export async function createPopup(req, res) {
    const data = req.body ;
  try {
   if (req.file) {
      data.image = await uploadToS3(req.file);
    }
    const popup = await Popup.create(data);
    res.status(201).json({ success: true, data: popup });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// LIST (with optional search, status, pagination)
export async function listPopups(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort = '-createdOn'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ name: rx }, { heading: rx }, { subheading: rx }, { ctaButtonText: rx }];
    }
    const [data, total] = await Promise.all([
      Popup.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Popup.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// GET BY ID
export async function getPopupById(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid popup id' });
    const popup = await Popup.findById(id);
    if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
    res.json({ success: true, data: popup });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// UPDATE
export async function updatePopup(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid popup id' });
    req.body.updatedOn = new Date(); // update timestamp
    const popup = await Popup.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
    res.json({ success: true, data: popup });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// DELETE
export async function deletePopup(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid popup id' });
    const deleted = await Popup.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Popup not found' });
    res.json({ success: true, message: 'Popup deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// TOGGLE STATUS (activate/inactivate)
export async function togglePopupStatus(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid popup id' });
    const popup = await Popup.findById(id);
    if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
    popup.status = popup.status === 'active' ? 'inactive' : 'active';
    popup.updatedOn = new Date();
    await popup.save();
    res.json({ success: true, data: popup, message: `Popup set to ${popup.status}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
