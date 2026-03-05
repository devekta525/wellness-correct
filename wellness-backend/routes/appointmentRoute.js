import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
  getTodaysAppointmentsCount,
  exportAppointments,
  getMyAppointments,
  getMyNotifications,
} from '../controllers/appointmentController.js';
import { isLogin } from '../middleware/isLogin.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { isDoctor } from '../middleware/isDoctor.js';
import { isCustomer } from '../middleware/isCustomer.js';

const router = Router();

router.use(isLogin);

// DEBUG endpoint to check doctor info
router.get('/debug/info', isDoctor, (req, res) => {
  res.json({
    doctorId: req.user._id,
    doctorEmail: req.user.email,
    doctorRole: req.user.role,
    doctorName: `${req.user.firstName} ${req.user.lastName}`
  });
});

// POST - Create appointment (Doctors or Admins)
router.post('/', (req, res, next) => {
  if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, createAppointment);

// GET - Specific routes BEFORE /:id wildcard
// export and stats are useful for both doctors and admins.  Previously only
// admins could invoke them which blocked doctor-panel users; switch to a
// simple inline role check similar to the root list route.
router.get('/export', (req, res, next) => {
  const role = (req.user?.role || "").toString().toLowerCase();
  if (role === 'doctor' || role === 'admin' || role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, exportAppointments);
router.get('/stats', (req, res, next) => {
  const role = (req.user?.role || "").toString().toLowerCase();
  if (role === 'doctor' || role === 'admin' || role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, getAppointmentStats);
router.get('/today/count', isDoctor, getTodaysAppointmentsCount);
// GET - Appointments for the logged-in user (Doctor or Customer)
router.get('/my-appointments', getMyAppointments);
// GET - Notifications for the logged-in user
router.get('/my-notifications', getMyNotifications);

// GET - All appointments (list) - Admin or Doctor
// Previously this route used `isAdmin` only which blocked doctors from
// viewing the appointment list.  Doctors should also have access so we
// perform a custom role check inline (mirrors other checks above).
router.get('/', (req, res, next) => {
  const role = (req.user?.role || "").toString().toLowerCase();
  if (role === 'doctor' || role === 'admin' || role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, getAppointments);

// GET, PUT, DELETE - Single appointment by ID (Doctor or Admin)
router.get('/:id', getAppointmentById);
router.put('/:id', (req, res, next) => {
  if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, updateAppointment);
router.delete('/:id', (req, res, next) => {
  if (req.user.role.toLowerCase() === 'doctor' || req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'super_admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctor or Admin access required" });
}, deleteAppointment);

export default router;
