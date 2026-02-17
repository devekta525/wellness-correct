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
} from '../controllers/appointmentController.js';
import { isLogin } from '../middleWares/isLogin.js';

const router = Router();

router.use(isLogin);

// DEBUG endpoint to check doctor info
router.get('/debug/info', (req, res) => {
  res.json({
    doctorId: req.user._id,
    doctorEmail: req.user.email,
    doctorRole: req.user.role,
    doctorName: `${req.user.firstName} ${req.user.lastName}`
  });
});

// POST - Create appointment
router.post('/', createAppointment);

// GET - Specific routes BEFORE /:id wildcard
router.get('/export', exportAppointments);
router.get('/stats', getAppointmentStats);
router.get('/today/count', getTodaysAppointmentsCount);
// GET - Appointments for the logged-in user
router.get('/my-appointments', getMyAppointments);

// GET - All appointments (list)
router.get('/', getAppointments);

// GET, PUT, DELETE - Single appointment by ID
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;