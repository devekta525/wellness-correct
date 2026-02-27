import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/orderModel.js';

// Lazy initialization - create Razorpay instance only when needed
let instance = null;

const getRazorpayInstance = () => {
    if (!instance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
        }
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return instance;
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;
        const instance = getRazorpayInstance();

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency,
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            orderId
        } = req.body;

        // orderId here is the database Order ID if we link it, 
        // or we might just be verifying the payment signature independently first.
        // For this implementation let's assume we just verify signature 
        // and then frontend calls update status, or we do it here.

        const body = razorpayOrderId + "|" + razorpayPaymentId;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpaySignature;

        if (isAuthentic) {
            // Payment is successful
            // If orderId is provided, we can update the order status
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'Paid',
                    razorpayOrderId,
                    razorpayPaymentId,
                    razorpaySignature,
                    isPaid: true
                });
            }

            res.json({
                success: true,
                message: "Payment successfully verified",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};
