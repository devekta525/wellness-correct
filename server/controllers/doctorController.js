const asyncHandler = require('express-async-handler');
const { uploadToCloudinary } = require('../config/cloudinary');
const DoctorProfile = require('../models/DoctorProfile');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const MedicineList = require('../models/MedicineList');
const User = require('../models/User');
const Product = require('../models/Product');
const paymentManager = require('../services/payment/paymentManager');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Determine meeting status based on scheduled time
const getMeetingStatus = (scheduledAt, duration = 30) => {
  const now = Date.now();
  const start = new Date(scheduledAt).getTime();
  const preStart = start - 10 * 60 * 1000;        // 10 min before
  const end = start + (duration + 15) * 60 * 1000; // end + 15 min grace
  if (now >= preStart && now <= end) return 'live';
  if (now < preStart) return 'upcoming';
  return 'ended';
};

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/doctors
exports.getDoctors = asyncHandler(async (req, res) => {
  const { specialization, search, page = 1, limit = 12 } = req.query;
  const filter = { isApproved: true, isActive: true };
  if (specialization) filter.specialization = new RegExp(specialization, 'i');

  const total = await DoctorProfile.countDocuments(filter);
  let query = DoctorProfile.find(filter)
    .populate('user', 'name email avatar')
    .sort({ 'rating.average': -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  let doctors = await query;

  if (search) {
    const s = search.toLowerCase();
    doctors = doctors.filter(d =>
      d.user?.name?.toLowerCase().includes(s) ||
      d.specialization?.toLowerCase().includes(s) ||
      d.bio?.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, doctors, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
});

// GET /api/doctors/specializations
exports.getSpecializations = asyncHandler(async (req, res) => {
  const specs = await DoctorProfile.distinct('specialization', { isApproved: true, isActive: true });
  res.json({ success: true, specializations: specs });
});

// GET /api/doctors/:id
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id)
    .populate('user', 'name email avatar');
  if (!doctor || !doctor.isApproved) { res.status(404); throw new Error('Doctor not found'); }
  res.json({ success: true, doctor });
});

// GET /api/doctors/:id/booked-slots?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns booked consultation slots so the UI can hide them (Calendly-style).
exports.getDoctorBookedSlots = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id).select('_id');
  if (!doctor || !doctor.isApproved) { res.status(404); throw new Error('Doctor not found'); }

  let from = req.query.from ? new Date(req.query.from) : new Date();
  let to = req.query.to ? new Date(req.query.to) : new Date(from);
  to.setDate(to.getDate() + 14);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const consultations = await Consultation.find({
    doctor: doctor._id,
    status: { $in: ['pending', 'confirmed', 'ongoing'] },
    scheduledAt: { $gte: from, $lte: to },
  })
    .select('scheduledAt duration')
    .lean();

  const slots = consultations.map(c => ({
    start: new Date(c.scheduledAt).toISOString(),
    end: new Date(new Date(c.scheduledAt).getTime() + (c.duration || 30) * 60 * 1000).toISOString(),
  }));

  res.json({ success: true, slots });
});

// ─── Doctor Profile Management ────────────────────────────────────────────────

// GET /api/doctors/me/profile
exports.getMyProfile = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id })
    .populate('user', 'name email avatar phone');
  res.json({ success: true, profile: profile || null });
});

// POST /api/doctors/me/profile  (create or update)
exports.upsertMyProfile = asyncHandler(async (req, res) => {
  const { specialization, qualifications, experience, bio, languages, consultationFee,
    consultationDuration, profileImage, availability, gmeetLink, registrationNumber } = req.body;

  if (!specialization) { res.status(400); throw new Error('Specialization is required'); }
  if (!consultationFee && consultationFee !== 0) { res.status(400); throw new Error('Consultation fee is required'); }

  // Set user role to doctor
  await User.findByIdAndUpdate(req.user._id, { role: 'doctor' });

  const profile = await DoctorProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id, specialization, qualifications: qualifications || [],
      experience: experience || 0, bio, languages: languages || ['English', 'Hindi'],
      consultationFee: Number(consultationFee), consultationDuration: consultationDuration || 30,
      profileImage, availability: availability || [], gmeetLink, registrationNumber,
    },
    { upsert: true, new: true, runValidators: true }
  ).populate('user', 'name email avatar');

  res.json({ success: true, profile });
});

// POST /api/doctors/me/upload-profile-image  (multipart: image file)
exports.uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error('Image file is required');
  }
  let result;
  try {
    result = await uploadToCloudinary(req.file.buffer, {
      folder: 'Wellness_fuel/doctors',
      quality: 'auto',
    });
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('cloud_name') || msg.includes('disabled') || (err.http_code === 401)) {
      res.status(503);
      throw new Error('Image upload not configured. Please try again later.');
    }
    throw err;
  }
  res.json({ success: true, url: result.secure_url, publicId: result.public_id });
});

// ─── Consultations (Doctor side) ──────────────────────────────────────────────

// GET /api/doctors/me/consultations
exports.getMyConsultationsAsDoctor = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id });
  if (!profile) { res.status(404); throw new Error('Doctor profile not found'); }

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { doctor: profile._id };
  if (status) filter.status = status;

  const total = await Consultation.countDocuments(filter);
  const consultations = await Consultation.find(filter)
    .populate('patient', 'name email phone avatar')
    .sort({ scheduledAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Attach meeting status
  const enriched = consultations.map(c => ({
    ...c.toObject(),
    meetingStatus: getMeetingStatus(c.scheduledAt, c.duration),
  }));

  res.json({ success: true, consultations: enriched, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
});

// PUT /api/doctors/me/consultations/:id/status
exports.updateConsultationStatus = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id });
  if (!profile) { res.status(404); throw new Error('Doctor profile not found'); }

  const consultation = await Consultation.findOne({ _id: req.params.id, doctor: profile._id });
  if (!consultation) { res.status(404); throw new Error('Consultation not found'); }

  const { status, doctorNotes } = req.body;
  if (status) consultation.status = status;
  if (doctorNotes !== undefined) consultation.doctorNotes = doctorNotes;

  if (status === 'completed') {
    await DoctorProfile.findByIdAndUpdate(profile._id, { $inc: { totalConsultations: 1 } });
  }

  await consultation.save();
  res.json({ success: true, consultation });
});

// ─── Prescriptions (Doctor side) ─────────────────────────────────────────────

// POST /api/doctors/me/consultations/:id/prescription
exports.createPrescription = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id });
  if (!profile) { res.status(404); throw new Error('Doctor profile not found'); }

  const consultation = await Consultation.findOne({ _id: req.params.id, doctor: profile._id })
    .populate('patient', 'name email');
  if (!consultation) { res.status(404); throw new Error('Consultation not found'); }

  const { diagnosis, medicines, products, notes, followUpDate } = req.body;

  // Upsert: one prescription per consultation
  const prescription = await Prescription.findOneAndUpdate(
    { consultation: consultation._id },
    {
      consultation: consultation._id,
      doctor: profile._id,
      patient: consultation.patient._id,
      diagnosis: diagnosis || '',
      medicines: (medicines || []).map(m => ({
        medicine: m.medicineId || undefined,
        medicineName: m.medicineName,
        packSizeLabel: m.packSizeLabel || '',
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        duration: m.duration || '',
        instructions: m.instructions || '',
      })),
      products: (products || []).map(p => ({
        product: p.productId || undefined,
        productName: p.productName,
        thumbnail: p.thumbnail || '',
        dosage: p.dosage || '',
        frequency: p.frequency || '',
        duration: p.duration || '',
        instructions: p.instructions || '',
      })),
      notes: notes || '',
      followUpDate: followUpDate || undefined,
      issuedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  )
    .populate('doctor', 'specialization')
    .populate('medicines.medicine', 'name packSizeLabel price')
    .populate('products.product', 'title thumbnail price slug');

  res.json({ success: true, prescription });
});

// GET /api/doctors/me/consultations/:id/prescription
exports.getPrescriptionByConsultation = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ user: req.user._id });
  const prescription = await Prescription.findOne({ consultation: req.params.id, doctor: profile?._id })
    .populate('medicines.medicine', 'name packSizeLabel price')
    .populate('products.product', 'title thumbnail price slug');
  res.json({ success: true, prescription: prescription || null });
});

// ─── Medicine Search (shared) ─────────────────────────────────────────────────

// GET /api/doctors/medicines/search?q=paracetamol
exports.searchMedicines = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  if (!q || q.trim().length < 2) return res.json({ success: true, medicines: [] });

  const filter = {
    $or: [
      { name: new RegExp(q, 'i') },
      { shortComposition1: new RegExp(q, 'i') },
      { manufacturerName: new RegExp(q, 'i') },
    ],
    isDiscontinued: false,
  };

  const medicines = await MedicineList.find(filter)
    .select('name packSizeLabel price manufacturerName shortComposition1 type')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .lean();

  res.json({ success: true, medicines });
});

// ─── Patient: Book Consultation (any active gateway, pay-to-confirm) ───────────

// POST /api/doctors/:doctorId/book
exports.bookConsultation = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.doctorId);
  if (!doctor || !doctor.isApproved) { res.status(404); throw new Error('Doctor not found'); }

  const activeGateways = await paymentManager.getActiveGateways();
  if (!activeGateways.length) { res.status(503); throw new Error('No payment gateway enabled. Please try again later.'); }

  let { scheduledAt, symptoms, gatewayId } = req.body;
  if (!scheduledAt) { res.status(400); throw new Error('scheduledAt is required'); }
  if (!gatewayId) gatewayId = activeGateways[0].id;
  const gateway = activeGateways.find(g => g.id === gatewayId);
  if (!gateway) { res.status(400); throw new Error('Selected payment gateway is not available'); }

  const slot = new Date(scheduledAt);
  const bufferMs = (doctor.consultationDuration + 5) * 60 * 1000;
  const conflict = await Consultation.findOne({
    doctor: doctor._id,
    status: { $in: ['pending', 'confirmed', 'ongoing'] },
    scheduledAt: { $gte: new Date(slot - bufferMs), $lte: new Date(slot.getTime() + bufferMs) },
  });
  if (conflict) { res.status(400); throw new Error('This time slot is already booked. Please choose another time.'); }

  const consultation = await Consultation.create({
    patient: req.user._id,
    doctor: doctor._id,
    scheduledAt: slot,
    duration: doctor.consultationDuration,
    amount: doctor.consultationFee,
    meetingLink: doctor.gmeetLink || '',
    symptoms: symptoms || '',
    paymentMethod: gatewayId,
    paymentStatus: 'pending',
    status: 'pending',
  });

  // PayU callback identifies consultation by txnid prefix "consult_<id>"
  const orderIdForGateway = gatewayId === 'payu' ? `consult_${consultation._id}` : consultation._id.toString();
  const customerInfo = { name: req.user.name || 'Patient', email: req.user.email || '' };

  const paymentOrder = await paymentManager.createOrder(gatewayId, {
    amount: consultation.amount,
    orderId: orderIdForGateway,
    currency: 'INR',
    customerInfo,
  });

  const gatewayOrderId = paymentOrder.id || paymentOrder.razorpayOrderId || paymentOrder.txn_id ||
    paymentOrder.cashfreeOrderId || paymentOrder.paymentIntentId || '';
  await Consultation.findByIdAndUpdate(consultation._id, { paymentGatewayOrderId: gatewayOrderId });

  res.status(201).json({ success: true, consultation, gatewayId, paymentOrder });
});

// POST /api/doctors/consultations/payment/verify
exports.verifyConsultationPayment = asyncHandler(async (req, res) => {
  const { gatewayId, consultationId, ...rest } = req.body;
  if (!gatewayId || !consultationId) {
    res.status(400);
    throw new Error('gatewayId and consultationId are required');
  }

  const consultation = await Consultation.findOne({ _id: consultationId, patient: req.user._id });
  if (!consultation) { res.status(404); throw new Error('Consultation not found'); }

  let payload = { ...rest };
  if (gatewayId === 'cashfree' && !payload.cashfree_order_id && consultation.paymentGatewayOrderId) {
    payload.cashfree_order_id = consultation.paymentGatewayOrderId;
  }
  if (gatewayId === 'stripe' && !payload.payment_intent_id && consultation.paymentGatewayOrderId) {
    payload.payment_intent_id = consultation.paymentGatewayOrderId;
  }

  const result = await paymentManager.verifyPayment(gatewayId, payload);

  await Consultation.findByIdAndUpdate(consultationId, {
    paymentStatus: 'paid',
    status: 'confirmed',
    paymentId: result.paymentId || '',
  });
  const updated = await Consultation.findById(consultationId);

  res.json({ success: true, consultation: updated, paymentId: result.paymentId });
});

// ─── Patient: My Consultations + Prescriptions ───────────────────────────────

// GET /api/doctors/my-consultations
exports.getMyConsultationsAsPatient = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Consultation.countDocuments({ patient: req.user._id });
  const consultations = await Consultation.find({ patient: req.user._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .sort({ scheduledAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const enriched = consultations.map(c => ({
    ...c.toObject(),
    meetingStatus: getMeetingStatus(c.scheduledAt, c.duration),
  }));

  res.json({ success: true, consultations: enriched, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
});

// GET /api/doctors/my-prescriptions
exports.getMyPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.user._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('consultation', 'scheduledAt status')
    .populate('medicines.medicine', 'name price')
    .populate('products.product', 'title thumbnail price slug')
    .sort({ issuedAt: -1 });
  res.json({ success: true, prescriptions });
});

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.adminGetDoctors = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status === 'approved') filter.isApproved = true;
  if (status === 'pending') filter.isApproved = false;
  const total = await DoctorProfile.countDocuments(filter);
  const doctors = await DoctorProfile.find(filter)
    .populate('user', 'name email avatar phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, doctors, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
});

exports.adminGetDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id).populate('user', 'name email avatar phone role');
  if (!doctor) { res.status(404); throw new Error('Doctor not found'); }
  res.json({ success: true, doctor });
});

exports.adminUpdateDoctor = asyncHandler(async (req, res) => {
  const { isApproved, isActive, adminNotes } = req.body;
  const doctor = await DoctorProfile.findById(req.params.id);
  if (!doctor) { res.status(404); throw new Error('Doctor not found'); }

  if (isApproved !== undefined) doctor.isApproved = isApproved;
  if (isActive !== undefined) doctor.isActive = isActive;
  if (adminNotes !== undefined) doctor.adminNotes = adminNotes;

  // Sync user role
  if (isApproved === false) {
    await User.findByIdAndUpdate(doctor.user, { role: 'customer' });
  } else if (isApproved === true) {
    await User.findByIdAndUpdate(doctor.user, { role: 'doctor' });
  }

  await doctor.save();
  res.json({ success: true, doctor });
});

exports.adminDeleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findByIdAndDelete(req.params.id);
  if (!doctor) { res.status(404); throw new Error('Doctor not found'); }
  await User.findByIdAndUpdate(doctor.user, { role: 'customer' });
  res.json({ success: true, message: 'Doctor profile deleted' });
});

exports.adminGetAllConsultations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const total = await Consultation.countDocuments(filter);
  const consultations = await Consultation.find(filter)
    .populate('patient', 'name email')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .sort({ scheduledAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, consultations, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
});
