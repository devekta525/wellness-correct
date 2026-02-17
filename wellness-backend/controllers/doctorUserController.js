import { validationResult } from 'express-validator';
import User from '../models/userModel.js';
// Create a new doctor
export async function createDoctor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();

    // Remove password from response
    const { password, ...doctorResponse } = savedDoctor.toObject();
    res.status(201).json(doctorResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Update doctor by ID
export async function updateDoctor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedDoctor = await User.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    ).select('-password');

    if (!updatedDoctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Toggle doctor status
export async function toggleDoctorStatus(req, res) {
  try {
    const doctor = await User.findOne({ _id: req.params.id });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
    doctor.status = newStatus;
    await doctor.save();

    res.json({
      message: `Doctor ${newStatus} successfully`,
      status: doctor.status
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all doctors
export async function getAllDoctors(req, res) {
  try {
    const doctors = await User.find().select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get doctor by ID
export async function getDoctorById(req, res) {
  try {
    const doctor = await User.findOne({ _id: req.params.id }).select('-password');
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function countDoctors(req, res) {
  try {
    const userRole = req.user.role;

    // Check if user is admin
    const isAdmin = ['super_admin', 'admin'].includes(userRole);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view doctor counts'
      });
    }

    const count = await User.countDocuments({ role: 'Doctor' });
    console.log('✅ Total doctors count retrieved:', count);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Error counting doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to count doctors',
      error: error.message
    });
  }
}
