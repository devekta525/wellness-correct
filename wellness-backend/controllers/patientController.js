import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import { Parser } from 'json2csv';

const isId = (id) => mongoose.isValidObjectId(id);

// export const createPatient = async (req, res) => {
//     try {
//         const patientData = {
//             ...req.body,
//             role: 'Customer'
//         };

//         if (!patientData.password) {
//             const tempPassword = Math.random().toString(36).slice(-8);
//             patientData.password = tempPassword;
//         }

//         const newPatient = await User.create(patientData);
//         newPatient.password = undefined;

//         res.status(201).json({ success: true, data: newPatient });
//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(409).json({ success: false, message: 'Email or phone already exists.' });
//         }
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

export const createPatient = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            age,
            gender,
            bloodGroup,
            location,
            address,
            city,
            state,
            zipCode,
            patientType,
            medicalHistory,
            currentMedications,
            allergies,
            emergencyContact,
            insuranceProvider,
            notes,
            password,
            tags,
        } = req.body;

        // ✅ validations
        if (!firstName || !lastName || !email || !phone || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: "firstName, lastName, email, phone and dateOfBirth are required",
            });
        }

        // ✅ Generate temp password if not provided
        const generatedPassword =
            password || Math.random().toString(36).slice(-8);

        const patientData = {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            age,
            gender,
            bloodGroup,
            location,
            address,
            city,
            state,
            zipCode,
            patientType,
            medicalHistory,
            currentMedications,
            allergies,
            emergencyContact,
            insuranceProvider,
            notes,
            tags,
            password: generatedPassword,
            createdBy: req.user._id, // Save which doctor created this patient
        };

        const newPatient = await User.create(patientData);

        // ✅ Hide password in response
        const patientResponse = newPatient.toObject();
        delete patientResponse.password;

        return res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patientResponse,

            // ✅ OPTIONAL: return temporary password
            // In production you should EMAIL/SMS this instead of returning it.
            tempPassword: password ? null : generatedPassword,
        });
    } catch (error) {
        console.log("Create patient error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or phone already exists.",
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getPatients = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            patientType,
            search,
            sortBy = 'firstName',
            sortOrder = 'asc'
        } = req.query;

        // Filter by logged-in doctor
        const filter = { createdBy: req.user._id };
        if (status && status !== 'all') filter.status = status;
        if (patientType && patientType !== 'all') filter.patientType = patientType;

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { bloodGroup: searchRegex },
                { patientId: searchRegex }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const patients = await User.find(filter)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select('-password');

        await Promise.all(
            patients
                .filter((patient) => !patient.patientId)
                .map(async (patient) => {
                    patient.markModified("patientId");
                    await patient.save();
                })
        );

        const total = await User.countDocuments(filter);

        const patientIds = patients.map(p => p._id);

        const appointmentStats = await Appointment.aggregate([
            { $match: { patient: { $in: patientIds } } },
            {
                $group: {
                    _id: '$patient',
                    totalVisits: { $sum: 1 },
                    totalFees: { $sum: '$fee' },
                    lastVisit: { $max: '$appointmentDate' }
                }
            }
        ]);

        const statsMap = appointmentStats.reduce((acc, stat) => {
            acc[stat._id] = stat;
            return acc;
        }, {});

        const populatedPatients = patients.map(p => {
            const stats = statsMap[p._id] || { totalVisits: 0, totalFees: 0, lastVisit: null };
            return {
                ...p.toObject(),
                ...stats,
            };
        });

        res.json({
            success: true,
            data: populatedPatients,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const patient = await User.findOne({ _id: id, createdBy: req.user._id }).select('-password');
        if (!patient) return res.status(404).json({ success: false, message: 'Patient not found or access denied' });

        if (!patient.patientId) {
            patient.markModified("patientId");
            await patient.save();
        }

        const stats = await Appointment.aggregate([
            { $match: { patient: patient._id } },
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: 1 },
                    totalFees: { $sum: '$fee' },
                    lastVisit: { $max: '$appointmentDate' }
                }
            }
        ]);

        const finalPatientData = {
            ...patient.toObject(),
            ...(stats[0] || { totalVisits: 0, totalFees: 0, lastVisit: null })
        };
        delete finalPatientData._id;

        res.json({ success: true, data: finalPatientData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const updateData = req.body;
        delete updateData.password; // Prevent password update through this route
        delete updateData.createdBy; // Prevent changing who created the patient
        delete updateData.patientId; // Prevent changing patient ID

        const updatedPatient = await User.findOneAndUpdate(
            { _id: id, createdBy: req.user._id },
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedPatient) return res.status(404).json({ success: false, message: 'Patient not found or access denied' });
        res.json({ success: true, data: updatedPatient });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        // Soft delete can also be an option by setting status to 'inactive'
        const deletedPatient = await User.findOneAndDelete({ _id: id, createdBy: req.user._id });

        if (!deletedPatient) return res.status(404).json({ success: false, message: 'Patient not found or access denied' });

        // Also delete related appointments
        await Appointment.deleteMany({ patient: id });

        res.json({ success: true, message: 'Patient and related appointments deleted successfully', id });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPatientStats = async (req, res) => {
    try {
        const [
            totalPatients,
            activePatients,
            vipPatients,
            visitStats
        ] = await Promise.all([
            User.countDocuments({ createdBy: req.user._id }),
            User.countDocuments({ createdBy: req.user._id, status: 'active' }),
            User.countDocuments({ createdBy: req.user._id, patientType: 'vip' }),
            Appointment.aggregate([
                { $group: { _id: null, totalVisits: { $sum: 1 }, totalFees: { $sum: '$fee' } } }
            ])
        ]);

        const { totalVisits = 0, totalFees = 0 } = visitStats[0] || {};
        const avgVisitFee = totalVisits > 0 ? Math.round(totalFees / totalVisits) : 0;

        res.json({
            success: true,
            data: {
                totalPatients,
                activePatients,
                vipPatients,
                avgVisitFee
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getTotalPatientsCount = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ createdBy: req.user._id });

        res.json({
            success: true,
            data: {
                totalPatients
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const exportPatients = async (req, res) => {
    try {
        const patients = await User.find().select('-password').lean();

        if (patients.length === 0) {
            return res.status(404).json({ success: false, message: 'No patients found to export' });
        }

        const fields = [
            'firstName', 'lastName', 'email', 'phone', 'status',
            'patientType', 'age', 'bloodGroup', 'location',
            'medicalHistory', 'currentMedications', 'allergies',
            'emergencyContact.phone', 'insuranceProvider', 'tags'
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(patients);

        res.header('Content-Type', 'text/csv');
        res.attachment(`patients-export-${new Date().toISOString()}.csv`);
        res.send(csv);

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
    }
};