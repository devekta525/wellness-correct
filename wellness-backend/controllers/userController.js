import { deleteOldImage, uploadFile } from "../config/s3Config.js";
import User from "../models/userModel.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const data = req.body;

    if (!data.firstName || !data.lastName || !data.email || !data.password) {
      return res.status(400).json({ success: false, message: "First name, last name, email, and password are required" });
    }
    if (req.file) {
      data.imageUrl = await uploadFile(req.file);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create(data);

    res.status(201).json({ success: true, message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update logged-in user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, email, phone, bio, address, dateOfBirth } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields only if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (!phone && !user.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required"
      });
    } else if (phone !== undefined) {
      user.phone = phone;
    }

    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) user.address = address;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    // Handle optional image upload
    if (req.file) {
      if (user.imageUrl) {
        await deleteOldImage(user.imageUrl);
      }

      user.imageUrl = await uploadFile(req.file);
    }


    // Save the user
    await user.save();

    // Return updated user data, excluding password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    // Handle specific errors like duplicate email
    if (error.code === 11000 && (error.keyPattern?.email || error.keyValue?.email)) {
      return res.status(400).json({ success: false, message: "Email already in use by another account." });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,          // optional filter: Admin/Doctor/Influencer/Customer
      status,        // optional filter: Active/Inactive
      search         // optional search on name/email/phone
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [
        { firstName: rx },
        { lastName: rx },
        { email: rx },
        { phone: rx }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-password'), // hide sensitive field if present
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getTotalUsersCount = async (req, res) => {
  try {
    const total = await User.countDocuments();
    res.status(200).json({ success: true, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}


// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      const user = await User.findById(req.params.id);
      if (user?.imageUrl) await deleteOldImage(user.imageUrl);
      updates.imageUrl = await uploadFile(req.file);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
