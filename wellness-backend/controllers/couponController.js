import mongoose from "mongoose";
import Coupon from "../models/couponModel.js";


const isId = (id) => mongoose.isValidObjectId(id);

// Create
export async function createCoupon(req, res) {
  try {
    const payload = req.body ;
    const coupon = await Coupon.create(payload);
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Something Went Wrong While Creating The Coupon' });
    }
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.code) {
      return res.status(409).json({ success: false, message: 'Coupon Code Already Exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
}

// List with filters/pagination
export async function listCoupons(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      q,
      from,
      to,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (q) {
      filter.$or = [{ code: new RegExp(q, 'i') }];
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      Coupon.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Coupon.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
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

// Get one
export async function getCouponById(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update
export async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const update = { ...req.body };
    if (update.code) update.code = update.code.toUpperCase().trim();

    const coupon = await Coupon.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.code) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
}

// Delete
export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Coupon not found' });

    res.json({ success: true, message: 'Coupon deleted', id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Activate / Deactivate
export async function setCouponStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'inactive'
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await Coupon.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });

    res.json({ success: true, message: `Coupon ${status}`, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Validate/apply coupon to an order amount
// body: { code, userId, orderAmount }
// returns: { valid, discount, finalAmount, reasons? }
export async function validateAndApply(req, res) {
  try {
    const { code, userId, orderAmount } = req.body;
    if (!code || typeof orderAmount !== 'number') {
      return res.status(400).json({ success: false, message: 'code and numeric orderAmount are required' });
    }

    const now = new Date();
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const reasons = [];

    // Status and date checks
    if (coupon.status !== 'active') reasons.push('Coupon is inactive');
    if (now < coupon.startDate) reasons.push('Coupon not started yet');
    if (now > coupon.expiryDate) reasons.push('Coupon expired');

    // Global usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      reasons.push('Coupon usage limit reached');
    }

    // Min order
    if (orderAmount < (coupon.minOrderValue || 0)) {
      reasons.push(`Minimum order value is ${coupon.minOrderValue}`);
    }

    // Applicable users constraint (if provided)
    if (coupon.applicableUsers?.length) {
      if (!userId || !coupon.applicableUsers.some(u => u.toString() === String(userId))) {
        reasons.push('Coupon is not applicable for this user');
      }
    }

    // Per-user usage limit check (optional; requires external usage tracking)
    // This endpoint expects the caller to enforce per-user count in order service.
    // Provide a hint when userUsageLimit is defined:
    const perUserLimit = coupon.userUsageLimit ?? 1;

    if (reasons.length) {
      return res.status(400).json({
        success: false,
        valid: false,
        reasons
      });
    }

    // Compute discount
    let discount = 0;
    if (coupon.type === 'Percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount !== null && coupon.maxDiscount >= 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'Fixed') {
      discount = coupon.value;
    }

    discount = Math.max(0, Math.min(discount, orderAmount));
    const finalAmount = Math.max(0, orderAmount - discount);

    res.json({
      success: true,
      valid: true,
      discountType: coupon.type,
      discountValue: coupon.value,
      discount,
      finalAmount,
      userUsageLimit: perUserLimit
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Increment usage count (call after successful order placement)
export async function redeem(req, res) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Invalid code' });

    const updated = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase().trim() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });

    res.json({ success: true, message: 'Usage incremented', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
