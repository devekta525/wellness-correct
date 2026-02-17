import mongoose from "mongoose";
import Rating from "../models/ratingModel.js";

// CREATE
export const createRating = async (req, res) => {
  try {
    const { user, product, rating, from } = req.body;

    if (!user && !product) {
      return res.status(400).json({
        success: false,
        message: "At least one of user or product must be provided.",
      });
    }

    if (!from) {
      return res.status(400).json({
        success: false,
        message: "From field is required.",
      });
    }

    const newRating = new Rating({ user, product, rating, from });
    await newRating.save();

    res.status(201).json({ success: true, data: newRating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL
export const getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("user")
      .populate("product")
      .populate("from");
    res.json({ success: true, data: ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE
export const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const rating = await Rating.findById(id)
      .populate("user")
      .populate("product")
      .populate("from");

    if (!rating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    res.json({ success: true, data: rating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, product, rating } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const existing = await Rating.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    // Rule: Don't allow changing user once set
    if (existing.user && user && user.toString() !== existing.user.toString()) {
      return res.status(400).json({ success: false, message: "User cannot be changed once set." });
    }

    // Rule: Don't allow changing product once set
    if (existing.product && product && product.toString() !== existing.product.toString()) {
      return res.status(400).json({ success: false, message: "Product cannot be changed once set." });
    }

    if (rating) existing.rating = rating;

    await existing.save();
    res.json({ success: true, data: existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const deleted = await Rating.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    res.json({ success: true, message: "Rating deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
