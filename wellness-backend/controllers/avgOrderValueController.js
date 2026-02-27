import mongoose from 'mongoose';
import Order from '../models/orderModel.js';

/**
 * @desc    Calculate Average Order Value for the logged-in user
 * @route   GET /api/v1/orders/avg-order-value
 * @access  Private (user must be logged in)
 */
export const getAvgOrderValue = async (req, res) => {
  try {
    // The user's ID is attached to the request by the isLogin middleware
    const userId = req.user._id;

    const aggregationPipeline = [
      {
        // 1. Match orders for the logged-in user that represent a valid purchase
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isDeleted: { $ne: true }, // Exclude soft-deleted orders
          status: { $nin: ['Cancelled', 'Returned', 'Failed'] } // Exclude non-purchase statuses
        }
      },
      {
        // 2. Group all matched documents to calculate totals
        $group: {
          _id: null, // Group all into a single result
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        // 3. Project the final fields and calculate the average
        $project: {
          _id: 0, // Exclude the _id field from the output
          totalSpent: 1,
          orderCount: 1,
          avgOrderValue: {
            // Safely divide, returning 0 if orderCount is 0
            $cond: {
              if: { $eq: ["$orderCount", 0] },
              then: 0,
              else: { $divide: ["$totalSpent", "$orderCount"] }
            }
          }
        }
      }
    ];

    const stats = await Order.aggregate(aggregationPipeline);

    // If the user has no orders, the aggregation returns an empty array
    const result = stats.length > 0 ? stats[0] : { orderCount: 0, totalSpent: 0, avgOrderValue: 0 };

    // Respond with the calculated statistics, formatted to 2 decimal places for currency
    res.status(200).json({
      success: true,
      orderCount: result.orderCount,
      totalSpent: parseFloat(result.totalSpent.toFixed(2)),
      avgOrderValue: parseFloat(result.avgOrderValue.toFixed(2))
    });

  } catch (error) {
    console.error("Error calculating Average Order Value:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate average order value.",
      error: error.message
    });
  }
};