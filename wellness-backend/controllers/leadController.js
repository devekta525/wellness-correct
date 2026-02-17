import mongoose from 'mongoose';
import Lead from '../models/leadModel.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

// CREATE
export async function createLead(req, res) {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'name, email, and phone are required' });
  }
  try {
    const lead = await Lead.create(req.body);
    if (!lead) {
      return res.status(400).json({ success: false, message: 'Lead creation failed' });
    }
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
}

// READ: list with filters and pagination
export async function listLeads(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      source,
      assignedTo,
      q,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [
        { name: rx },
        { email: rx },
        { subject: rx },
        { phone: rx },
        { message: rx }
      ];
    }

    const [items, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Lead.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// READ: single
export async function getLeadById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// UPDATE
export async function updateLead(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const updated = await Lead.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead updated', data: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
}

// DELETE
export async function deleteLead(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, message: 'Lead deleted', id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// PATCH helpers
export async function updateLeadStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const updated = await Lead.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function touchLastContact(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const updated = await Lead.findByIdAndUpdate(id, { lastContactDate: new Date() }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, message: 'Last contact updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
