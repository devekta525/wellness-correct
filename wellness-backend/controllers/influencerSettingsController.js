import User from "../models/userModel.js";

// Validation helpers
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const validateURL = (url) => {
  try {
    const urlWithProto = url.startsWith('http') ? url : `https://${url}`;
    new URL(urlWithProto);
    return true;
  } catch {
    return false;
  }
};

// Get all settings (Profile, Business, Security)
export const getInfluencerSettings = async (req, res) => {
  try {
    console.log("Fetching settings for user:", req.user._id);

    // Try to find in User collection first, then fallback to User
    let user = await User.findById(req.user._id).select("-password");
    if (!user) {
      user = await User.findById(req.user._id).select("-password");
    }

    if (!user) {
      console.log("User not found in any collection");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("User found:", user.email);

    // Structure data to match frontend expectations
    const settingsData = {
      profile: {
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        niche: user.category || "",
        followers: user.followers || 0,
        engagement: user.engagementRate || 0, // Ensure field exists in model or calculate it
        platform: user.platform || "",
        location: user.location || "",
        bio: user.notes || "", // Using 'notes' field for bio, or add 'bio' to schema
        avatar: user.imageUrl || "",
        languages: user.language || [],
        collaborationRate: user.collaborationRate || 0,
        sponsoredPostRate: user.sponsoredPostRate || 0 // Add to schema if missing
      },
      business: {
        brandName: user.brandName || "", // Add to schema
        businessAddress: user.businessAddress || "", // Add to schema
        businessPhone: user.businessPhone || "", // Add to schema
        businessEmail: user.businessEmail || "", // Add to schema
        website: user.website || "", // Add to schema
        taxId: user.taxId || "", // Add to schema
        businessType: user.businessType || "", // Add to schema
        socialMedia: user.socialMediaLinks ? JSON.parse(user.socialMediaLinks) : {
          instagram: "",
          tiktok: "",
          youtube: "",
          twitter: ""
        },
        averagePostTime: user.averagePostTime || 0, // Add to schema
        maxCollaborationsPerMonth: user.maxCollaborationsPerMonth || 0, // Add to schema
        brandPartnerships: user.brandPartnerships ?? true // Add to schema
      },
      security: {
        twoFactorAuth: user.twoFactorEnabled,
        loginAlerts: user.loginAlerts ?? false, // Add to schema
        sessionTimeout: user.sessionTimeout || 30, // Add to schema
        passwordExpiry: user.passwordExpiry || 90, // Add to schema
        ipWhitelist: user.ipWhitelist || [], // Add to schema
        auditLogs: user.auditLogs ?? true, // Add to schema
        dataEncryption: user.dataEncryption ?? true, // Add to schema
        backupFrequency: user.backupFrequency || "daily" // Add to schema
      }
    };

    res.status(200).json({ success: true, data: settingsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile Settings
export const updateProfileSettings = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      niche,
      followers,
      engagement,
      platform,
      location,
      bio,
      languages,
      collaborationRate,
      sponsoredPostRate
    } = req.body;

    // Validation
    if (email && !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    // Build update object with validated fields
    const updateData = {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      category: niche || undefined,
      followers: followers ? parseInt(followers, 10) : undefined,
      engagementRate: engagement ? parseFloat(engagement) : undefined,
      platform: platform || undefined,
      location: location || undefined,
      notes: bio || undefined, // Using notes field for bio
      language: Array.isArray(languages) ? languages : undefined,
      collaborationRate: collaborationRate ? parseFloat(collaborationRate) : undefined
    };

    // Remove undefined fields to avoid overwriting with null
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Try User model first
    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    // Fallback to User model
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile settings updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Profile settings update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Business Settings
export const updateBusinessSettings = async (req, res) => {
  try {
    const {
      brandName,
      businessAddress,
      businessPhone,
      businessEmail,
      website,
      taxId,
      businessType,
      socialMedia,
      averagePostTime,
      maxCollaborationsPerMonth,
      brandPartnerships
    } = req.body;

    // Validation
    if (businessEmail && !validateEmail(businessEmail)) {
      return res.status(400).json({ success: false, message: "Invalid business email format" });
    }

    if (businessPhone && !validatePhone(businessPhone)) {
      return res.status(400).json({ success: false, message: "Invalid business phone format" });
    }

    if (website && !validateURL(website)) {
      return res.status(400).json({ success: false, message: "Invalid website URL" });
    }

    // Build update object
    const updateData = {
      brandName: brandName || undefined,
      businessAddress: businessAddress || undefined,
      businessPhone: businessPhone || undefined,
      businessEmail: businessEmail || undefined,
      website: website || undefined,
      taxId: taxId || undefined,
      businessType: businessType || undefined,
      socialMediaLinks: socialMedia ? JSON.stringify(socialMedia) : undefined,
      averagePostTime: averagePostTime ? parseInt(averagePostTime, 10) : undefined,
      maxCollaborationsPerMonth: maxCollaborationsPerMonth ? parseInt(maxCollaborationsPerMonth, 10) : undefined,
      brandPartnerships: brandPartnerships !== undefined ? Boolean(brandPartnerships) : undefined
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Try User model first
    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    // Fallback to User model
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Business settings updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Business settings update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Security Settings
export const updateSecuritySettings = async (req, res) => {
  try {
    const {
      twoFactorAuth,
      loginAlerts,
      sessionTimeout,
      passwordExpiry,
      ipWhitelist,
      auditLogs,
      dataEncryption,
      backupFrequency
    } = req.body;

    // Validation
    if (sessionTimeout !== undefined && (sessionTimeout < 5 || sessionTimeout > 1440)) {
      return res.status(400).json({
        success: false,
        message: "Session timeout must be between 5 and 1440 minutes"
      });
    }

    if (passwordExpiry !== undefined && (passwordExpiry < 0 || passwordExpiry > 365)) {
      return res.status(400).json({
        success: false,
        message: "Password expiry must be between 0 and 365 days"
      });
    }

    // Validate IP whitelist
    if (Array.isArray(ipWhitelist)) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/; // Simple IP validation
      for (const ip of ipWhitelist) {
        if (!ipRegex.test(ip)) {
          return res.status(400).json({
            success: false,
            message: `Invalid IP address format: ${ip}`
          });
        }
      }
    }

    // Build update object
    const updateData = {
      twoFactorEnabled: twoFactorAuth !== undefined ? Boolean(twoFactorAuth) : undefined,
      loginAlerts: loginAlerts !== undefined ? Boolean(loginAlerts) : undefined,
      sessionTimeout: sessionTimeout ? parseInt(sessionTimeout, 10) : undefined,
      passwordExpiry: passwordExpiry !== undefined ? parseInt(passwordExpiry, 10) : undefined,
      ipWhitelist: Array.isArray(ipWhitelist) ? ipWhitelist : undefined,
      auditLogs: auditLogs !== undefined ? Boolean(auditLogs) : undefined,
      dataEncryption: dataEncryption !== undefined ? Boolean(dataEncryption) : undefined,
      backupFrequency: backupFrequency || undefined
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Try User model first
    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    // Fallback to User model
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Security settings updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Security settings update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Avatar (Handle file upload separately usually, or via URL here)
export const updateAvatar = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }

    // Validate URL format
    if (!validateURL(imageUrl)) {
      return res.status(400).json({ success: false, message: "Invalid image URL format" });
    }

    // Try User model first
    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { imageUrl: imageUrl },
      { new: true, runValidators: true }
    ).select("-password");

    // Fallback to User model
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { imageUrl: imageUrl },
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Avatar update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};