import User from '../models/userModel.js';

export const addPaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.paymentMethods.push(req.body);
        if (user.paymentMethods.length === 1) {
            user.paymentMethods[0].isDefault = true;
        }
        await user.save();
        res.status(201).json({ success: true, data: user.paymentMethods });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPaymentMethods = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user.paymentMethods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.paymentMethods.pull({ _id: req.params.methodId });
        await user.save();
        res.json({ success: true, data: user.paymentMethods });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const setDefaultPaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.paymentMethods.forEach(method => {
            method.isDefault = method._id.toString() === req.params.methodId;
        });
        await user.save();
        res.json({ success: true, data: user.paymentMethods });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};