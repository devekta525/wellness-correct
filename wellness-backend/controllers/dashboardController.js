import mongoose from 'mongoose';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import Prescription from '../models/prescriptionModel.js';
import Rating from '../models/ratingModel.js';

export const getDoctorDashboardData = async (req, res) => {
    try {
        const doctorId = req.user._id;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            doctorData,
            todaysAppointmentsCount,
            totalPatientsResult,
            totalPrescriptionsCount,
            averageRatingResult,
            todaysAppointmentsList,
            recentPrescriptionsList
        ] = await Promise.all([
            User.findById(doctorId).select('consultationFee experience').lean(),
            Appointment.countDocuments({ doctor: doctorId, appointmentDate: { $gte: today, $lt: tomorrow } }),
            Appointment.distinct('patient', { doctor: doctorId }),
            Prescription.countDocuments({ doctor: doctorId }),
            Rating.aggregate([
                { $match: { product: doctorId } },
                { $group: { _id: null, avgRating: { $avg: '$rating' } } }
            ]),
            Appointment.find({ doctor: doctorId, appointmentDate: { $gte: today, $lt: tomorrow } })
                .sort({ appointmentTime: 1 })
                .limit(5)
                .populate('patient', 'firstName lastName')
                .select('appointmentTime type status patient')
                .lean(),
            Prescription.find({ doctor: doctorId })
                .sort({ createdAt: -1 })
                .limit(4)
                .populate('patient', 'firstName lastName')
                .select('medications patient createdAt status')
                .lean()
        ]);

        const totalPatients = totalPatientsResult.length;
        const averageRating = averageRatingResult.length > 0 ? averageRatingResult[0].avgRating.toFixed(1) : 'N/A';

        const stats = {
            todaysAppointments: todaysAppointmentsCount,
            totalPatients: totalPatients,
            prescriptionsWritten: totalPrescriptionsCount,
            consultationFee: doctorData.consultationFee || 0,
            rating: averageRating,
            experience: `${doctorData.experience || 0} Years`
        };

        const todaysAppointments = todaysAppointmentsList.map(app => ({
            time: app.appointmentTime,
            patient: `${app.patient.firstName} ${app.patient.lastName}`,
            type: app.type,
            status: app.status.charAt(0).toUpperCase() + app.status.slice(1)
        }));

        const recentPrescriptions = recentPrescriptionsList.map(pres => ({
            patient: `${pres.patient.firstName} ${pres.patient.lastName}`,
            medication: pres.medications.length > 0 ? pres.medications[0].productName : 'N/A',
            dosage: pres.medications.length > 0 ? pres.medications[0].frequency : 'N/A',
            date: new Date(pres.createdAt).toLocaleDateString(),
            status: pres.status.charAt(0).toUpperCase() + pres.status.slice(1)
        }));

        res.json({
            success: true,
            data: {
                stats,
                todaysAppointments,
                recentPrescriptions
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};