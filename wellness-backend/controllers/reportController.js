import mongoose from 'mongoose';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import Prescription from '../models/prescriptionModel.js';

const getDateRange = (period, from, to) => {
    const endDate = to ? new Date(to) : new Date();
    endDate.setUTCHours(23, 59, 59, 999);
    let startDate;

    if (period === 'custom' && from) {
        startDate = new Date(from);
    } else {
        startDate = new Date(endDate);
        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case '30d':
            default:
                startDate.setDate(startDate.getDate() - 30);
                break;
        }
    }
    startDate.setUTCHours(0, 0, 0, 0);
    return { startDate, endDate };
};

export const getOverviewReport = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { period = '30d', from, to } = req.query;
        const { startDate, endDate } = getDateRange(period, from, to);

        const dateFilter = { doctor: doctorId, createdAt: { $gte: startDate, $lte: endDate } };
        const patientDateFilter = { role: 'Customer', createdAt: { $gte: startDate, $lte: endDate } };

        const [
            totalAppointments,
            totalPatients,
            totalPrescriptions,
            revenueResult,
            emergencyCases
        ] = await Promise.all([
            Appointment.countDocuments(dateFilter),
            User.countDocuments(patientDateFilter),
            Prescription.countDocuments(dateFilter),
            Appointment.aggregate([
                {
                    $match: {
                        doctor: new mongoose.Types.ObjectId(doctorId),
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: 'completed',
                        paymentStatus: 'paid'
                    }
                },
                { $group: { _id: null, totalRevenue: { $sum: '$fee' } } }
            ]),
            Appointment.countDocuments({ ...dateFilter, type: 'emergency' }),
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.json({
            success: true,
            data: {
                totalAppointments,
                totalPatients,
                totalPrescriptions,
                totalRevenue,
                emergencyCases,
                patientSatisfaction: 4.8,
                avgConsultationTime: 25,
                followUpRate: 78
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getAppointmentReport = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { period = '30d', from, to } = req.query;
        const { startDate, endDate } = getDateRange(period, from, to);

        const trends = await Appointment.aggregate([
            { $match: { doctor: new mongoose.Types.ObjectId(doctorId), appointmentDate: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                    appointments: { $sum: 1 },
                    revenue: { $sum: '$fee' },
                    uniquePatients: { $addToSet: '$patient' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    appointments: 1,
                    revenue: 1,
                    patients: { $size: '$uniquePatients' },
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        res.json({ success: true, data: trends });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getPatientReport = async (req, res) => {
    try {
        const analytics = await User.aggregate([
            { $match: { role: 'Customer' } },
            { $unwind: '$medicalHistory' },
            { $group: { _id: '$medicalHistory', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
            {
                $project: {
                    _id: 0,
                    condition: '$_id',
                    count: 1
                }
            }
        ]);

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPrescriptionReport = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { period = '30d', from, to } = req.query;
        const { startDate, endDate } = getDateRange(period, from, to);

        const analytics = await Prescription.aggregate([
            { $match: { doctor: new mongoose.Types.ObjectId(doctorId), createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$medications' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'medications.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$medications.productName',
                    prescriptions: { $sum: 1 },
                    uniquePatients: { $addToSet: '$patient' },
                    totalCost: { $sum: { $multiply: ['$medications.quantity', '$productInfo.price.amount'] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    medication: '$_id',
                    prescriptions: 1,
                    patients: { $size: '$uniquePatients' },
                    cost: '$totalCost'
                }
            },
            { $sort: { prescriptions: -1 } },
            { $limit: 5 }
        ]);

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const exportReport = async (req, res) => {
    try {
        const { reportType = 'overview', format = 'json', ...queryParams } = req.query;

        let data;
        let reportName = 'Report';

        switch (reportType) {
            case 'overview':
                const overviewRes = await getOverviewReport({ user: req.user, query: queryParams }, { json: d => data = d, status: () => ({ json: e => { throw new Error(e.message) } }) });
                reportName = 'Overview_Report';
                break;
            case 'appointments':
                const apptRes = await getAppointmentReport({ user: req.user, query: queryParams }, { json: d => data = d, status: () => ({ json: e => { throw new Error(e.message) } }) });
                reportName = 'Appointment_Trends';
                break;
            case 'patients':
                const patientRes = await getPatientReport({ user: req.user, query: queryParams }, { json: d => data = d, status: () => ({ json: e => { throw new Error(e.message) } }) });
                reportName = 'Patient_Analytics';
                break;
            case 'prescriptions':
                const presRes = await getPrescriptionReport({ user: req.user, query: queryParams }, { json: d => data = d, status: () => ({ json: e => { throw new Error(e.message) } }) });
                reportName = 'Prescription_Analytics';
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid report type" });
        }

        const fileName = `${reportName}_${new Date().toISOString().split('T')[0]}`;

        if (format === 'json') {
            res.header('Content-Type', 'application/json');
            res.attachment(`${fileName}.json`);
            return res.send(JSON.stringify(data.data, null, 2));
        }

        if (format === 'csv') {
            const { Parser } = await import('json2csv');
            const parser = new Parser();
            const csv = parser.parse(data.data);
            res.header('Content-Type', 'text/csv');
            res.attachment(`${fileName}.csv`);
            return res.send(csv);
        }

        if (format === 'pdf') {
            res.header('Content-Type', 'text/plain');
            res.attachment(`${fileName}.txt`);
            return res.send(`PDF export is a complex feature requiring a dedicated library. Here is your data in JSON format:\n\n${JSON.stringify(data.data, null, 2)}`);
        }

        return res.status(400).json({ success: false, message: 'Unsupported format' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export report', error: error.message });
    }
};