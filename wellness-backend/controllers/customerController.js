import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Appointment from '../models/appointmentModel.js';
import Prescription from '../models/prescriptionModel.js';
import Address from '../models/addressModel.js';

export const getMyStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const stats = await Order.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    lastOrderDate: { $max: '$createdAt' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalOrders: 1,
                    totalSpent: 1,
                    lastOrderDate: 1,
                    averageOrderValue: { $cond: [{ $eq: ["$totalOrders", 0] }, 0, { $divide: ["$totalSpent", "$totalOrders"] }] }
                }
            }
        ]);
        
        const result = stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0, lastOrderDate: 'No orders yet' };

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate('doctor', 'firstName lastName specialization imageUrl')
            .sort({ appointmentDate: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.user._id })
            .populate('doctor', 'firstName lastName specialization')
            .sort({ prescriptionDate: -1 });
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const downloadMyData = async (req, res) => {
    try {
        const userId = req.user._id;
        const [user, addresses, orders, appointments, prescriptions] = await Promise.all([
            User.findById(userId).select('-password -paymentMethods').lean(),
            Address.findOne({ user: userId }).lean(),
            Order.find({ user: userId }).lean(),
            Appointment.find({ patient: userId }).lean(),
            Prescription.find({ patient: userId }).lean()
        ]);

        const data = {
            profile: user,
            addresses: addresses ? addresses.addresses : [],
            orders,
            appointments,
            prescriptions
        };
        
        const fileName = `wellness-fuel-data-${userId}.json`;
        res.header('Content-Type', 'application/json');
        res.attachment(fileName);
        res.send(JSON.stringify(data, null, 2));

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export async function countCustomers(req, res) {
    try {
        const userRole = req.user.role;

        // Check if user is admin
        const isAdmin = ['super_admin', 'admin'].includes(userRole);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can view customer counts'
            });
        }

        const count = await User.countDocuments({ role: 'Customer' });
        console.log('✅ Total customers count retrieved:', count);

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('❌ Error counting customers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to count customers',
            error: error.message
        });
    }
}