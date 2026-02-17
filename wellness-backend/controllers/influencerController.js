import { validationResult } from 'express-validator';
import User from '../models/userModel.js';

// Generate a unique referral code for influencer
const generateUniqueReferralCode = async (firstName) => {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Create code: first 4 letters of name + 4 random digits
    const namePrefix = firstName.substring(0, 4).toUpperCase().padEnd(4, 'X');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = namePrefix + randomNum;

    // Check if code already exists in User collection
    const existingInfluencer = await User.findOne({ referralCode: code });
    if (!existingInfluencer) {
      return code;
    }

    attempts++;
  }

  // Fallback: use timestamp if all attempts failed
  const timestamp = Date.now().toString().slice(-6);
  return firstName.substring(0, 2).toUpperCase() + timestamp;
};

// Create a new influencer
export async function createInfluencer(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const influencer = new Influencer(req.body);

    // Generate unique referral code if not provided
    if (!influencer.referralCode && influencer.firstName) {
      influencer.referralCode = await generateUniqueReferralCode(influencer.firstName);
    }

    const savedInfluencer = await influencer.save();

    // Remove password from response
    const { password, ...influencerResponse } = savedInfluencer.toObject();
    res.status(201).json(influencerResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Update influencer by ID
export async function updateInfluencer(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedInfluencer = await User.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    ).select('-password');

    if (!updatedInfluencer) return res.status(404).json({ error: 'Influencer not found' });
    res.json(updatedInfluencer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Toggle influencer status
export async function toggleInfluencerStatus(req, res) {
  try {
    const influencer = await User.findOne({ _id: req.params.id });
    if (!influencer) return res.status(404).json({ error: 'Influencer not found' });

    const newStatus = influencer.status === 'active' ? 'inactive' : 'active';
    influencer.status = newStatus;
    await influencer.save();

    res.json({
      message: `Influencer ${newStatus} successfully`,
      status: influencer.status
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all influencers
export async function getAllInfluencers(req, res) {
  try {
    const influencers = await User.find().select('-password');
    res.json(influencers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get influencer by ID
export async function getInfluencerById(req, res) {
  try {
    const influencer = await User.findOne({ _id: req.params.id }).select('-password');
    if (!influencer) return res.status(404).json({ error: 'Influencer not found' });
    res.json(influencer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Count total influencers
export async function countInfluencers(req, res) {
  try {
    const userRole = req.user.role;

    // Check if user is admin
    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view influencer counts'
      });
    }

    const count = await User.countDocuments({ role: 'Influencer' });
    console.log('✅ Total influencers count retrieved:', count);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Error counting influencers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to count influencers',
      error: error.message
    });
  }
}
