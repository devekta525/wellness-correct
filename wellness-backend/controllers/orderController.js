import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Product from '../models/productsModel.js';
import Coupon from '../models/couponModel.js';

const isId = (id) => mongoose.isValidObjectId(id);


export async function createOrder(req, res) {
  try {
    console.log('📥 Received order creation request');
    console.log('User ID from Token:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const userId = req.user._id;

    if (!req.body.orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }

    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    // 1. Fetch Products from DB to get real prices
    const itemsRequest = req.body.items;
    const productIds = itemsRequest.map(item => item.product);

    // Check for duplicates
    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate products in order'
      });
    }

    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found' });
    }

    // 2. Construct Secure Items Array & Calculate Subtotal
    let calculatedSubtotal = 0;
    const secureItems = itemsRequest.map(item => {
      const dbProduct = dbProducts.find(p => p._id.toString() === item.product);
      const price = dbProduct.price.amount;
      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) throw new Error(`Invalid quantity for ${dbProduct.name}`);

      const total = price * quantity;
      calculatedSubtotal += total;

      return {
        product: item.product,
        quantity: quantity,
        price: price, // Secure price from DB
        total: total
      };
    });

    // 3. Calculate Financials
    // Shipping: Free if subtotal >= 500, else 49
    const shippingCost = calculatedSubtotal >= 500 ? 0 : 49;

    // Coupon Logic
    let discountValue = 0;
    let isCouponApplied = false;
    let couponCode = req.body.couponCode;
    let discountType = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'Active' });
      // Basic validation (add more if needed like expiry/usage limit)
      if (coupon && new Date() <= coupon.expiryDate && calculatedSubtotal >= coupon.minOrderValue) {
        isCouponApplied = true;
        discountType = coupon.type;
        if (coupon.type === 'Percentage') {
          discountValue = (calculatedSubtotal * coupon.value) / 100;
          if (coupon.maxDiscount) discountValue = Math.min(discountValue, coupon.maxDiscount);
        } else {
          discountValue = coupon.value;
        }
        // Cap discount at subtotal
        discountValue = Math.min(discountValue, calculatedSubtotal);
      }
    }

    // Tax (GST 18% on discounted subtotal)
    const taxableAmount = Math.max(0, calculatedSubtotal - discountValue);
    const tax = taxableAmount * 0.18;

    // Final Total
    const totalAmount = taxableAmount + shippingCost + tax;

    // 4. Validate Payment Status for Online orders
    if (req.body.paymentMethod === 'Online') {
      // Ideally verify Razorpay signature here or ensure paymentStatus is 'Paid'
      if (req.body.paymentStatus !== 'Paid') {
        return res.status(400).json({
          success: false,
          message: 'Online payment must be completed before placing order'
        });
      }
    }

    if (!req.body.shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Ensure discountType is undefined if null, to avoid Enum validation error
    const safeDiscountType = discountType || undefined;
    const safeCouponCode = isCouponApplied ? couponCode : undefined;

    const orderData = {
      orderNumber: req.body.orderNumber,
      user: userId,
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      items: secureItems,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus || 'Pending',
      shippingCost,
      tax,
      subtotal: calculatedSubtotal,
      totalAmount, // Pre-save hook will re-verify this
      isCouponApplied,
      couponCode: safeCouponCode,
      discountValue,
      discountType: safeDiscountType,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpaySignature: req.body.razorpaySignature
    };

    console.log('📝 Constructing Order Data:', JSON.stringify(orderData, null, 2));

    // Create the order
    const order = await Order.create(orderData);
    console.log('✅ Order created with ID:', order._id);

    // Populate references
    const populated = await Order.findById(order._id)
      .populate({ path: 'user', select: 'firstName lastName email' })
      .populate({ path: 'items.product', select: 'name price imageUrl' });

    console.log('✅ Order saved and populated successfully');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populated
    });

  } catch (err) {
    console.error('❌ Error creating order:', err);

    // Handle duplicate orderNumber
    if (err.code === 11000 && err.keyPattern?.orderNumber) {
      return res.status(409).json({
        success: false,
        message: 'Order number already exists'
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      console.error('❌ Mongoose Validation Errors:', err.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ${err.path}: ${err.value}`
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}


export async function getUserOrders(req, res) {
  try {
    const MAX_LIMIT = 100;
    const userId = req.user._id;

    let {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      sort = '-createdAt'
    } = req.query;

    // Enforce max limit
    limit = Math.min(Number(limit) || 10, MAX_LIMIT);
    page = Math.max(Number(page) || 1, 1);

    console.log('📋 Fetching orders for user:', userId);

    // Build filter with user's ID
    const filter = { user: userId };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate({ path: 'user', select: 'firstName lastName email' })
        .populate({ path: 'items.product', select: 'name price imageUrl' })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    console.log(`✅ Found ${orders.length} orders for user`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders'
    });
  }
}

export async function getUserOrdersCount(req, res) {
  try {
    const userId = req.user._id;
    const count = await Order.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      totalOrders: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to count orders'
    });
  }
}

export async function listOrders(req, res) {
  try {
    const MAX_LIMIT = 100;

    let {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      user,
      q,
      from,
      to,
      sort = '-createdAt'
    } = req.query;

    // Enforce max limit
    limit = Math.min(Number(limit) || 10, MAX_LIMIT);
    page = Math.max(Number(page) || 1, 1);

    // treat role in a case–insensitive manner; the schema stores
    // roles as "Admin" but many checks historically compared against
    // lowercase strings.
    const role = (req.user?.role || "").toString().toLowerCase();
    const isAdmin = role === 'admin' || role === 'super_admin';

    if (isAdmin) {
      console.log('📊 Admin fetching all orders');
    } else {
      console.log('📋 Regular user fetching their orders');
    }

    const filter = {};

    // Regular users can only see their own orders
    if (!isAdmin) {
      filter.user = req.user._id;
    } else if (user && isId(user)) {
      // Admins can filter by specific user if provided
      filter.user = user;
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (q) {
      filter.$or = [
        { orderNumber: new RegExp(q, 'i') },
        { trackingNumber: new RegExp(q, 'i') }
      ];
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate({ path: 'user', select: 'firstName lastName email' })
        .populate({ path: 'items.product', select: 'name price imageUrl' })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    console.log(`✅ Found ${orders.length} ${isAdmin ? 'total' : 'user'} orders`);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders'
    });
  }
}

export const countOrders = async (req, res) => {
  try {
    const userRole = (req.user.role || "").toString().toLowerCase();

    // Check if user is admin (case‑insensitive)
    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view order counts'
      });
    }

    const count = await Order.countDocuments();
    console.log('✅ Total orders count retrieved:', count);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Error counting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to count orders',
      error: error.message
    });
  }
};

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!isId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id)
      .populate({ path: 'user', select: 'firstName lastName email' })
      .populate({ path: 'items.product', select: 'name price imageUrl' });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Access control: Check if user is owner or admin
    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    const isOwner = order.user._id.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      console.warn('⚠️ Unauthorized order access attempt by user:', userId);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }

    console.log('✅ Order retrieved:', order._id);

    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    console.error('❌ Error fetching order:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch order'
    });
  }
}


export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (!isId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Check if user is admin
    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update orders'
      });
    }

    // Prevent updating sensitive fields
    const restrictedFields = ['user', 'totalAmount', 'subtotal'];
    const updateData = { ...req.body };

    restrictedFields.forEach(field => {
      delete updateData[field];
    });

    const updated = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
      .populate({ path: 'user', select: 'firstName lastName email' })
      .populate({ path: 'items.product', select: 'name price imageUrl' });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order updated:', id);

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('❌ Error updating order:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update order'
    });
  }
}


export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const adminUserId = req.user._id;

    if (!isId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete orders'
      });
    }

    // Soft delete: Mark as deleted instead of removing
    const deleted = await Order.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: adminUserId
      },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order soft-deleted:', id, 'by admin:', adminUserId);

    res.json({
      success: true,
      message: 'Order deleted successfully',
      id
    });
  } catch (err) {
    console.error('❌ Error deleting order:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete order'
    });
  }
}


export async function getUsersWithOrders(req, res) {
  try {
    const MAX_LIMIT = 100;
    const userRole = req.user.role;

    // Check if user is admin
    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view users with orders'
      });
    }

    let {
      page = 1,
      limit = 10,
      status,
      q,
      from,
      to,
      sort = '-totalOrders'
    } = req.query;

    // Enforce max limit
    limit = Math.min(Number(limit) || 10, MAX_LIMIT);
    page = Math.max(Number(page) || 1, 1);

    console.log('📊 Admin fetching users with orders');

    // Build match stage for order filtering
    const orderMatch = {};
    if (status) orderMatch.status = status;
    if (from || to) {
      orderMatch.createdAt = {};
      if (from) orderMatch.createdAt.$gte = new Date(from);
      if (to) orderMatch.createdAt.$lte = new Date(to);
    }

    // Aggregation pipeline to get users with their order statistics
    const pipeline = [
      { $match: orderMatch },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          returnedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          userId: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
          phone: '$user.phone',
          role: '$user.role',
          imageUrl: '$user.imageUrl',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1,
          lastOrderDate: 1,
          firstOrderDate: 1,
          pendingOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1,
          returnedOrders: 1
        }
      }
    ];

    // Add search filter if provided
    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { firstName: new RegExp(q, 'i') },
            { lastName: new RegExp(q, 'i') },
            { email: new RegExp(q, 'i') },
            { phone: new RegExp(q, 'i') }
          ]
        }
      });
    }

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Order.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add sorting
    let sortStage = {};
    if (sort.startsWith('-')) {
      sortStage[sort.substring(1)] = -1;
    } else {
      sortStage[sort] = 1;
    }
    pipeline.push({ $sort: sortStage });

    // Add pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const usersWithOrders = await Order.aggregate(pipeline);

    console.log(`✅ Found ${usersWithOrders.length} users with orders`);

    res.json({
      success: true,
      data: usersWithOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('❌ Error fetching users with orders:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch users with orders'
    });
  }
}

export async function getMyOrders(req, res) {
  try {
    const userId = req.user._id;

    console.log('📋 Fetching personal orders for user:', userId);

    const orders = await Order.find({ user: userId })
      .populate({ path: 'items.product', select: 'name price imageUrl' })
      .sort({ createdAt: -1 }); // Latest first

    console.log(`✅ Found ${orders.length} personal orders`);

    res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('❌ Error fetching my orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
}

export async function getUserNotifications(req, res) {
  try {
    const userId = req.user._id;

    // Fetch recent orders regardless of status
    const orders = await Order.find({
      user: userId
    }).sort({ createdAt: -1 }).limit(20);

    const notifications = orders.map(order => {
      const d = new Date(order.createdAt);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const time = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

      const itemCount = order.items ? order.items.length : 0;
      let title = `Order #${order.orderNumber} ${order.status}`;
      let message = `Your order of ${itemCount} items is currently ${order.status}`;

      switch (order.status) {
        case 'Delivered':
          title = `Order #${order.orderNumber} Delivered`;
          message = `Your order of ${itemCount} items has been successfully delivered`;
          break;
        case 'Pending':
          title = `Order #${order.orderNumber} Placed`;
          message = `Your order of ${itemCount} items has been placed successfully and is pending`;
          break;
        case 'Processing':
          title = `Order #${order.orderNumber} Processing`;
          message = `Your order of ${itemCount} items is currently being processed`;
          break;
        case 'Shipped':
          title = `Order #${order.orderNumber} Shipped`;
          message = `Your order of ${itemCount} items has been shipped and is on its way`;
          break;
        case 'Cancelled':
          title = `Order #${order.orderNumber} Cancelled`;
          message = `Your order of ${itemCount} items has been cancelled`;
          break;
        case 'Returned':
          title = `Order #${order.orderNumber} Returned`;
          message = `Your order of ${itemCount} items has been returned`;
          break;
      }

      return {
        title: title,
        message: message,
        date: date,
        time: time
      };
    });

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
}