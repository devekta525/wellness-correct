import mongoose from 'mongoose';
import Session from '../models/sessionModel.js';

const isId = (id) => mongoose.isValidObjectId(id);

// Get all sessions by userId
export async function getAllSessionsByUserId(req, res) {
  try {
    const userId = req.user._id;
    if (!isId(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const sessions = await Session.find({ user: userId })
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');

    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Delete all sessions by userId
export async function deleteAllSessionsByUserId(req, res) {
  try {
    const userId = req.user._id;
    if (!isId(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const result = await Session.deleteMany({ user: userId });

    res.json({
      success: true,
      message: 'All sessions deleted for user',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Delete one session by sessionId (for a specific user)
export async function deleteOneSessionByUserId(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    if (!isId(userId) || !isId(sessionId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id or session id' });
    }

    const deleted = await Session.findOneAndDelete({ _id: sessionId, user: userId });
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Session not found for this user' });
    }

    res.json({
      success: true,
      message: 'Session deleted',
      data: deleted
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

