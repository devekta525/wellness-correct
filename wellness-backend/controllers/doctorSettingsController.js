import User from "../models/userModel.js";

// Get all settings (Profile, Business, Security)
export const getDoctorSettings = async (req, res) => {
    try {
        const doctor = await User.findById(req.user._id).select("-password");

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Structure data to match frontend expectations
        const settingsData = {
            profile: {
                name: `${doctor.firstName} ${doctor.lastName}`,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization || "",
                experience: doctor.experience || 0,
                qualifications: doctor.qualifications || "",
                license: doctor.licenseNumber || "",
                hospital: doctor.hospital || "",
                location: doctor.location || "",
                bio: doctor.bio || "",
                avatar: doctor.imageUrl || "",
                languages: doctor.language || [],
                consultationFee: doctor.consultationFee || 0,
                emergencyFee: doctor.emergencyFee || 0,
                gender: doctor.gender || "",
                dateOfBirth: doctor.dateOfBirth || "",
            },
            business: {
                clinicName: doctor.clinicName || "",
                clinicAddress: doctor.clinicAddress || "",
                clinicPhone: doctor.clinicPhone || "",
                clinicEmail: doctor.clinicEmail || "",
                website: doctor.website || "",
                taxId: doctor.taxId || "",
                businessType: doctor.businessType || "Private Practice",
                operatingHours: doctor.operatingHours || {
                    monday: { start: "09:00", end: "17:00", closed: false },
                    tuesday: { start: "09:00", end: "17:00", closed: false },
                    wednesday: { start: "09:00", end: "17:00", closed: false },
                    thursday: { start: "09:00", end: "17:00", closed: false },
                    friday: { start: "09:00", end: "17:00", closed: false },
                    saturday: { start: "10:00", end: "14:00", closed: false },
                    sunday: { start: "00:00", end: "00:00", closed: true },
                },
                appointmentDuration: doctor.appointmentDuration || 30,
                maxPatientsPerDay: doctor.maxPatientsPerDay || 20,
                emergencyAvailability: doctor.emergencyAvailability ?? true,
            },
            security: {
                twoFactorAuth: doctor.twoFactorEnabled || false,
                loginAlerts: doctor.loginAlerts ?? false,
                sessionTimeout: doctor.sessionTimeout || 30,
                passwordExpiry: doctor.passwordExpiry || 90,
                ipWhitelist: doctor.ipWhitelist || [],
                auditLogs: doctor.auditLogs ?? true,
                dataEncryption: doctor.dataEncryption ?? true,
                backupFrequency: doctor.backupFrequency || "daily",
            },
        };

        res.status(200).json({ success: true, data: settingsData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Profile Settings
export const updateDoctorProfileSettings = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            specialization,
            experience,
            qualifications,
            license,
            hospital,
            location,
            bio,
            languages,
            consultationFee,
            emergencyFee,
            gender,
            dateOfBirth,
            avatar,
        } = req.body;

        const updateData = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(specialization && { specialization }),
            ...(experience !== undefined && { experience }),
            ...(qualifications && { qualifications }),
            ...(license && { licenseNumber: license }),
            ...(hospital && { hospital }),
            ...(location && { location }),
            ...(bio && { bio }),
            ...(languages && { language: languages }),
            ...(consultationFee !== undefined && { consultationFee }),
            ...(emergencyFee !== undefined && { emergencyFee }),
            ...(gender && { gender }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(avatar && { imageUrl: avatar }),
        };

        const updatedDoctor = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        res
            .status(200)
            .json({
                success: true,
                message: "Profile settings updated successfully",
                data: updatedDoctor,
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Business Settings
export const updateDoctorBusinessSettings = async (req, res) => {
    try {
        const {
            clinicName,
            clinicAddress,
            clinicPhone,
            clinicEmail,
            website,
            taxId,
            businessType,
            operatingHours,
            appointmentDuration,
            maxPatientsPerDay,
            emergencyAvailability,
        } = req.body;

        const updateData = {
            ...(clinicName && { clinicName }),
            ...(clinicAddress && { clinicAddress }),
            ...(clinicPhone && { clinicPhone }),
            ...(clinicEmail && { clinicEmail }),
            ...(website && { website }),
            ...(taxId && { taxId }),
            ...(businessType && { businessType }),
            ...(operatingHours && { operatingHours }),
            ...(appointmentDuration !== undefined && { appointmentDuration }),
            ...(maxPatientsPerDay !== undefined && { maxPatientsPerDay }),
            ...(emergencyAvailability !== undefined && { emergencyAvailability }),
        };

        const updatedDoctor = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        res
            .status(200)
            .json({
                success: true,
                message: "Business settings updated successfully",
                data: updatedDoctor,
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Security Settings
export const updateDoctorSecuritySettings = async (req, res) => {
    try {
        const {
            twoFactorAuth,
            loginAlerts,
            sessionTimeout,
            passwordExpiry,
            ipWhitelist,
            auditLogs,
            dataEncryption,
            backupFrequency,
        } = req.body;

        const updateData = {
            ...(twoFactorAuth !== undefined && { twoFactorEnabled: twoFactorAuth }),
            ...(loginAlerts !== undefined && { loginAlerts }),
            ...(sessionTimeout !== undefined && { sessionTimeout }),
            ...(passwordExpiry !== undefined && { passwordExpiry }),
            ...(ipWhitelist && { ipWhitelist }),
            ...(auditLogs !== undefined && { auditLogs }),
            ...(dataEncryption !== undefined && { dataEncryption }),
            ...(backupFrequency && { backupFrequency }),
        };

        const updatedDoctor = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        res
            .status(200)
            .json({
                success: true,
                message: "Security settings updated successfully",
                data: updatedDoctor,
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
