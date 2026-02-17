import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import passwordCheck from "../utils/passwordCheck.js";
import { UAParser } from "ua-parser-js";

// controllers/authController.js
import bcrypt from "bcrypt";

// Signup
export const signup = async (req, res) => {
  try {
    console.log('Signup request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate phone format (at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain at least 10 digits",
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required",
      });
    }

    // Validate age (must be at least 13 years old)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

    if (actualAge < 13) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 13 years old to register",
      });
    }

    if (actualAge > 120 || dob > today) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid date of birth",
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // Check if user exists in unified User collection
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
      if (existingUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }
    }

    // Determine role based on userType
    let role = "Customer"; // Default
    if (userType === 'doctor') {
      role = "Doctor";
    } else if (userType === 'influencer') {
      role = "Influencer";
    } else if (userType === 'admin') {
      role = "Admin";
    }

    const normalizedAddress = typeof address === "string" ? address.trim() : "";
    const normalizedCity = typeof city === "string" ? city.trim() : "";
    const normalizedState = typeof state === "string" ? state.trim() : "";
    const normalizedZipCode = zipCode !== undefined && zipCode !== null && zipCode !== ""
      ? Number(zipCode)
      : undefined;

    // Create user in unified User collection
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      address: normalizedAddress,
      city: normalizedCity,
      state: normalizedState,
      zipCode: Number.isNaN(normalizedZipCode) ? undefined : normalizedZipCode,
      role,
    };

    const user = await User.create(userData);
    console.log("Signup stored address:", {
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
    });

    // Auto-login logic
    const token = generateToken(user._id);

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    const session = await Session.create({
      user: user._id,
      userAgent,
      ipAddress: ip,
      isValid: true,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      token,
      deviceInfo,
    });

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "User registered successfully",
        data: user,
        session,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
        }
      });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const userAgent = req.headers["user-agent"];

  try {
    // Search in unified User collection
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    const session = await Session.create({
      user: user._id,
      userAgent,
      ipAddress: ip,
      isValid: true,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      token,
      deviceInfo,
    });

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "login successful",
        session,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Backend error",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).clearCookie("token").json({
      message: "logout",
    });
  } catch (error) {
    res.status(500).clearCookie("token").json({
      message: "server error",
    });
  }
};
export const check = async (req, res) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.log(error + " check problem");

    res.status(500).json({
      message: "server error",
    });
  }
};
export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(403).json({
      message: "All Detail Required",
    });
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }
    const isMatch = await passwordCheck(oldPassword, user.password);
    if (!isMatch) {
      return res.status(403).json({
        message: "Old Password is Incorrect",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error + " resetPassword problem");
    res.status(500).json({
      message: "server error",
    });
  }
};
