import mongoose from 'mongoose';
import Review from '../models/reviewModel.js';

const isId = (id) => mongoose.isValidObjectId(id);

// Create a review
export async function createReview(req, res) {
  try {
    const payload = { ...req.body };
    if (req.files && req.files.length > 0) {
      payload.images = await Promise.all(req.files.map(async (file) => {
        const imageUrl = await uploadToS3(file);
        return imageUrl;
      }));
    }
    const review = await Review.create(payload);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// List reviews with filters and pagination
export async function listReviews(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      minRating,
      maxRating,
      search,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (minRating) filter.rating = { ...(filter.rating || {}), $gte: Number(minRating) };
    if (maxRating) filter.rating = { ...(filter.rating || {}), $lte: Number(maxRating) };
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ name: rx }, { email: rx }, { review: rx }];
    }

    const [items, total] = await Promise.all([
      Review.find(filter).sort(sort).skip((page - 1) * limit).limit(Number(limit)),
      Review.countDocuments(filter)
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

// Get single review
export async function getReviewById(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update review
export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const updated = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });

    res.json({ success: true, message: 'Review updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Delete review
export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted', id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Moderate: approve/reject
export async function setReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Pending" | "Approved" | "Rejected"
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: `Review ${status.toLowerCase()}`, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
