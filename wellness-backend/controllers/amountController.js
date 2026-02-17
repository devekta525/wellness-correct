import mongoose from "mongoose";
import Order from "../models/orderModel.js";

export const getTotalSpentAmount = async (req, res) => {
  try {
    console.log("Calculating total spent for user:", req.user._id);
    const userId = req.user._id;

    const result = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" },
          isDeleted: { $ne: true } // Explicitly exclude deleted orders as aggregation bypasses pre-find hooks
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalAmount" }
        }
      }
    ]);

    console.log("Total spent result:", result);

    const totalSpent = result.length > 0 ? result[0].totalSpent : 0;

    res.status(200).json({
      success: true,
      totalSpent
    });
  } catch (error) {
    console.error("Error calculating total spent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate total spent amount",
      error: error.message
    });
  }
};