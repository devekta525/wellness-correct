import Contact from "../models/contactModel.js";

export const createContact = async (req, res) => {
    try {
        const { name, email, message, phone } = req.body;

        // Validate required fields
        if (!name || !email || !message || !phone) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // Check if contact with same email or phone already exists
        const existingContact = await Contact.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (existingContact) {
            const duplicateField = existingContact.email === email ? 'email' : 'phone';
            return res.status(409).json({
                success: false,
                error: `A contact with this ${duplicateField} already exists`,
                field: duplicateField
            });
        }

        // Create new contact
        const contact = await Contact.create(req.body);
        res.status(201).json({
            success: true,
            message: "Contact form submitted successfully",
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to submit contact form",
            message: error.message
        });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch contacts",
            message: error.message
        });
    }
};

export const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }
        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch contact",
            message: error.message
        });
    }
};

export const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to update contact",
            message: error.message
        });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully",
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to delete contact",
            message: error.message
        });
    }
};

export const countContacts = async (req, res) => {
    try {
        const userRole = req.user.role;

        // Check if user is admin
        const isAdmin = ['super_admin', 'admin'].includes(userRole);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can view contact counts'
            });
        }

        const count = await Contact.countDocuments();
        console.log('✅ Total contacts count retrieved:', count);

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('❌ Error counting contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to count contacts',
            error: error.message
        });
    }
};
