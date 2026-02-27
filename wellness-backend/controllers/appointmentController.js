import mongoose from 'mongoose';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import { Parser } from 'json2csv';

const isId = (id) => mongoose.isValidObjectId(id);

export const createAppointment = async (req, res) => {
  try {
    let doctorId = req.body.doctorId;
    let actualPatientId = req.body.patientId;

    if (req.user.role === 'Doctor') {
      doctorId = req.user._id;
    } else if (req.user.role === 'Customer' || req.user.role === 'User') {
      actualPatientId = req.user._id;
    }

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Valid doctor ID is required' });
    }

    const { patientEmail, patientName, patientPhone, appointmentDate, appointmentTime, duration, type, reason, fee, paymentStatus, status, notes, location } = req.body;

    // If actualPatientId not provided, try to find or create patient by email
    if (!actualPatientId && patientEmail) {
      try {
        // Try to find existing patient by email in User
        const existingCustomer = await User.findOne({ email: patientEmail });
        if (existingCustomer) {
          actualPatientId = existingCustomer._id;
        } else {
          // Fallback to legacy User collection
          const existingLegacyUser = await User.findOne({ email: patientEmail });
          if (existingLegacyUser) {
            actualPatientId = existingLegacyUser._id;
          } else {
            // Create new patient if doesn't exist
            const nameParts = patientName ? patientName.split(' ') : ['Patient', 'User'];
            const newCustomer = await User.create({
              firstName: nameParts[0],
              lastName: nameParts.slice(1).join(' ') || '',
              email: patientEmail,
              phone: patientPhone || '0000000000',
              password: 'temp123', // Temporary password, should be changed by patient
              dateOfBirth: new Date('1990-01-01'), // Default date of birth
              gender: 'Other',
              bloodGroup: 'O+',
              status: 'active'
            });
            actualPatientId = newCustomer._id;
          }
        }
      } catch (error) {
        return res.status(400).json({ success: false, message: 'Failed to find or create patient: ' + error.message });
      }
    }

    if (!actualPatientId || !isId(actualPatientId)) {
      return res.status(400).json({ success: false, message: 'Valid patient ID is required' });
    }

    let patientExists = await User.findById(actualPatientId);
    if (!patientExists) patientExists = await User.findById(actualPatientId);
    if (!patientExists) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Parse appointmentDate if it's a string (YYYY-MM-DD format from frontend)
    const parsedDate = typeof appointmentDate === 'string'
      ? new Date(appointmentDate + 'T00:00:00Z')
      : new Date(appointmentDate);

    // Prevent customers from forging fee and statuses
    let finalFee = Number(fee) || 0;
    let finalPaymentStatus = paymentStatus || 'pending';
    let finalStatus = status || 'pending';

    if (req.user.role === 'Customer' || req.user.role === 'User') {
      const doctor = await User.findById(doctorId);
      finalFee = doctor?.consultationFee || 0;
      finalPaymentStatus = 'pending';
      finalStatus = 'pending';
    }

    const appointment = await Appointment.create({
      patient: actualPatientId,
      patientName: patientName || `${patientExists.firstName} ${patientExists.lastName}`.trim(),
      doctor: doctorId,
      appointmentDate: parsedDate,
      appointmentTime,
      duration: Number(duration) || 30,
      type,
      reason,
      fee: finalFee,
      paymentStatus: finalPaymentStatus,
      status: finalStatus,
      notes: notes || '',
      location: location || 'Online'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone imageUrl')
      .populate('doctor', 'firstName lastName specialization');

    res.status(201).json({ success: true, data: populatedAppointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'appointmentDate',
      sortOrder = 'asc',
      date
    } = req.query;

    const filter = { doctor: new mongoose.Types.ObjectId(doctorId) };
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    if (date && date !== 'all') {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const sortOptions = {};
    if (sortBy === 'patientName') {
      sortOptions['patient.firstName'] = sortOrder === 'asc' ? 1 : -1;
      sortOptions['patient.lastName'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'customers',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientCustomer'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientUser'
        }
      },
      {
        $addFields: {
          patient: {
            $ifNull: [
              { $arrayElemAt: ['$patientCustomer', 0] },
              { $arrayElemAt: ['$patientUser', 0] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorDoctor'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorUser'
        }
      },
      {
        $addFields: {
          doctor: {
            $ifNull: [
              { $arrayElemAt: ['$doctorDoctor', 0] },
              { $arrayElemAt: ['$doctorUser', 0] }
            ]
          }
        }
      }
    ];

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      aggregationPipeline.push({
        $match: {
          $or: [
            { 'patient.firstName': searchRegex },
            { 'patient.lastName': searchRegex },
            { 'patient.email': searchRegex },
            { 'patient.phone': searchRegex },
            { reason: searchRegex }
          ]
        }
      });
    }

    const countPipeline = [...aggregationPipeline, { $count: 'total' }];
    const dataPipeline = [
      ...aggregationPipeline,
      { $sort: sortOptions },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      {
        $project: {
          patientCustomer: 0,
          patientUser: 0,
          doctorDoctor: 0,
          doctorUser: 0,
          'patient.password': 0,
          'doctor.password': 0
        }
      }
    ];

    const [[{ total = 0 } = {}], appointments] = await Promise.all([
      Appointment.aggregate(countPipeline),
      Appointment.aggregate(dataPipeline)
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ GET APPOINTMENTS ERROR:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const appointment = await Appointment.findOne({ _id: id, doctor: req.user._id })
      .populate('patient', 'firstName lastName email phone imageUrl')
      .populate('doctor', 'firstName lastName specialization');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient', 'firstName lastName email phone imageUrl')
      .populate('doctor', 'firstName lastName specialization');

    if (!updatedAppointment) return res.status(404).json({ success: false, message: 'Appointment not found or you are not authorized' });
    res.json({ success: true, data: updatedAppointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const deletedAppointment = await Appointment.findOneAndDelete({ _id: id, doctor: req.user._id });

    if (!deletedAppointment) return res.status(404).json({ success: false, message: 'Appointment not found or you are not authorized' });
    res.json({ success: true, message: 'Appointment deleted successfully', id });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTodaysAppointmentsCount = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalToday = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    res.json({
      success: true,
      data: {
        totalToday,
        date: today.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAppointmentStats = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todaysAppointments,
      totalAppointments,
      pendingAppointments,
      revenueResult
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId, appointmentDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'pending' }),
      Appointment.aggregate([
        { $match: { doctor: new mongoose.Types.ObjectId(doctorId), paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$fee' } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const totalCompleted = await Appointment.countDocuments({ doctor: doctorId, status: 'completed' });
    const confirmedToday = await Appointment.countDocuments({ doctor: doctorId, status: 'confirmed', appointmentDate: { $gte: today, $lt: tomorrow } })


    res.json({
      success: true,
      data: {
        todaysAppointments,
        totalAppointments,
        pendingAppointments,
        totalRevenue,
        totalCompleted,
        confirmedToday
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const exportAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    // Hum wahi filters/search use karenge jo getAppointments mein hain
    const { status, type, search, sortBy = 'appointmentDate', sortOrder = 'asc', date } = req.query;

    const filter = { doctor: new mongoose.Types.ObjectId(doctorId) };
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    if (date && date !== 'all') {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const sortOptions = {};
    if (sortBy === 'patientName') {
      sortOptions['patient.firstName'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const aggregationPipeline = [
      { $match: filter },
      { $lookup: { from: 'customers', localField: 'patient', foreignField: '_id', as: 'patientCustomer' } },
      { $lookup: { from: 'users', localField: 'patient', foreignField: '_id', as: 'patientUser' } },
      {
        $addFields: {
          patient: {
            $ifNull: [
              { $arrayElemAt: ['$patientCustomer', 0] },
              { $arrayElemAt: ['$patientUser', 0] }
            ]
          }
        }
      },
      { $sort: sortOptions },
      { $project: { patientCustomer: 0, patientUser: 0, 'patient.password': 0 } }
    ];

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      aggregationPipeline.push({
        $match: {
          $or: [
            { 'patient.firstName': searchRegex },
            { 'patient.lastName': searchRegex },
            { reason: searchRegex }
          ]
        }
      });
    }

    // Yahan pagination (limit/skip) nahi hoga, humein saara data chahiye
    const appointments = await Appointment.aggregate(aggregationPipeline);

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'No appointments found to export' });
    }

    // CSV ke liye data taiyaar karna
    const fields = [
      { label: 'Patient Name', value: 'patient.fullName' },
      { label: 'Patient Email', value: 'patient.email' },
      { label: 'Patient Phone', value: 'patient.phone' },
      { label: 'Appointment Date', value: 'appointmentDate' },
      { label: 'Appointment Time', value: 'appointmentTime' },
      { label: 'Duration (min)', value: 'duration' },
      { label: 'Type', value: 'type' },
      { label: 'Status', value: 'status' },
      { label: 'Reason', value: 'reason' },
      { label: 'Fee', value: 'fee' },
      { label: 'Payment Status', value: 'paymentStatus' },
      { label: 'Notes', value: 'notes' }
    ];

    // Har appointment object ko flat karna
    const formattedData = appointments.map(app => {
      const firstName = app.patient?.firstName || '';
      const lastName = app.patient?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        ...app,
        patient: {
          ...app.patient,
          fullName: fullName || 'Unknown'
        },
        appointmentDate: new Date(app.appointmentDate).toLocaleDateString()
      };
    });

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);

    const fileName = `appointments-${new Date().toISOString().split('T')[0]}.csv`;

    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.send(csv);

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
  }
};

/**
 * @desc    Get all appointments for the currently logged-in user (patient)
 * @route   GET /api/v1/appointments/my-appointments
 * @access  Private (requires user to be logged in)
 */
export async function getMyAppointments(req, res) {
  try {
    // The user's ID is attached to the request object by the isLogin middleware
    const userId = req.user._id;

    console.log(`📋 Fetching appointments for user: ${userId}`);

    // Find all appointments where the 'patient' field matches the logged-in user's ID
    // This ensures a user can only ever see their own appointments.
    const appointments = await Appointment.find({ patient: userId })
      .populate({
        path: 'doctor',
        select: 'firstName lastName specialization imageUrl', // Populate doctor details
      })
      .sort({ createdAt: -1 }); // Sort by latest first

    // Case: No appointments found for the user
    if (!appointments || appointments.length === 0) {
      console.log(`✅ No appointments found for user: ${userId}`);
      return res.status(200).json({
        success: true,
        message: 'You have no scheduled appointments.',
        appointments: [],
      });
    }

    console.log(`✅ Found ${appointments.length} appointments for user: ${userId}`);

    // Case: Appointments found, return them
    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully.',
      appointments: appointments,
    });
  } catch (error) {
    console.error('❌ Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your appointments.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * @desc    Get all appointment-based notifications for the logged-in user (patient)
 * @route   GET /api/v1/appointments/my-notifications
 * @access  Private (requires user to be logged in)
 */
export async function getMyNotifications(req, res) {
  try {
    const userId = req.user._id;

    const appointments = await Appointment.find({ patient: userId })
      .populate('doctor', 'firstName lastName specialization imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    if (!appointments.length) {
      return res.status(200).json({
        success: true,
        message: 'No notifications found.',
        data: [],
      });
    }

    const formattedNotifications = appointments.map(app => {
      const createdAt = new Date(app.createdAt);
      const appointmentDate = new Date(app.appointmentDate);

      const dateTime = `${createdAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} at ${createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase()}`;

      const appointmentDateFormatted = appointmentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });

      const doctorName = `Dr. ${app.doctor.firstName} ${app.doctor.lastName}`;
      let title;
      let message;

      switch (app.status) {
        case 'pending':
          title = 'Appointment Requested';
          message = `Your appointment request with ${doctorName} for ${appointmentDateFormatted} is pending.`;
          break;
        case 'confirmed':
          title = 'Appointment Scheduled';
          message = `Appointment with ${doctorName} scheduled for ${appointmentDateFormatted}`;
          break;
        case 'completed':
          title = 'Appointment Completed';
          message = `Your appointment with ${doctorName} on ${appointmentDateFormatted} was completed.`;
          break;
        case 'cancelled':
          title = 'Appointment Cancelled';
          message = `Your appointment with ${doctorName} on ${appointmentDateFormatted} has been cancelled.`;
          break;
        default:
          title = 'Appointment Update';
          message = `Your appointment with ${doctorName} on ${appointmentDateFormatted} has been updated.`;
          break;
      }

      return {
        title,
        message,
        dateTime,
        status: app.status,
        appointmentId: app._id.toString(),
      };
    });

    res.status(200).json({
      success: true,
      data: formattedNotifications,
    });

  } catch (error) {
    console.error('❌ Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your notifications.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}