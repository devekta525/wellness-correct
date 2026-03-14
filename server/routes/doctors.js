const express = require('express');
const router = express.Router();
const { protect, doctor } = require('../middleware/auth');
const { uploadMemory } = require('../config/cloudinary');
const {
  getDoctors, getSpecializations, getDoctorById, getDoctorBookedSlots,
  getMyProfile, upsertMyProfile, uploadProfileImage,
  getMyConsultationsAsDoctor, updateConsultationStatus,
  createPrescription, getPrescriptionByConsultation,
  searchMedicines,
  bookConsultation, verifyConsultationPayment,
  getMyConsultationsAsPatient, getMyPrescriptions,
} = require('../controllers/doctorController');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/medicines/search', searchMedicines);

// ── Patient (any logged-in user) ──────────────────────────────────────────────
router.get('/my-consultations', protect, getMyConsultationsAsPatient);
router.get('/my-prescriptions', protect, getMyPrescriptions);
router.post('/:doctorId/book', protect, bookConsultation);
router.post('/consultations/payment/verify', protect, verifyConsultationPayment);

// ── Doctor (doctor role) ──────────────────────────────────────────────────────
router.get('/me/profile', protect, getMyProfile); // any logged-in user (new applicants are still 'customer' role)
router.post('/me/profile', protect, upsertMyProfile); // any logged-in can apply to become doctor
router.post('/me/upload-profile-image', protect, uploadMemory.single('image'), uploadProfileImage);
router.get('/me/consultations', protect, doctor, getMyConsultationsAsDoctor);
router.put('/me/consultations/:id/status', protect, doctor, updateConsultationStatus);
router.get('/me/consultations/:id/prescription', protect, doctor, getPrescriptionByConsultation);
router.post('/me/consultations/:id/prescription', protect, doctor, createPrescription);

// ── Public doctor profile & availability (specific routes before /:id) ───────
router.get('/:id/booked-slots', getDoctorBookedSlots);
router.get('/:id', getDoctorById);

module.exports = router;
