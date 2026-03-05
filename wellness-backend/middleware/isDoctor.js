/**
 * Authorization Middleware - Check if user is Doctor
 * Verifies that the authenticated user has Doctor role
 * 
 * Usage:
 *   router.get('/doctor-only', isLogin, isDoctor, controllerFunction);
 * 
 * Error Responses:
 *   - 401: Not authenticated
 *   - 403: Not authorized (not a doctor)
 */

export const isDoctor = async (req, res, next) => {
    try {
        // User should be attached by isLogin middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if user has Doctor role (case-insensitive)
        const userRole = (req.user.role || "").toString().toLowerCase();
        if (userRole !== "doctor") {
            return res.status(403).json({
                success: false,
                message: "Doctor access required. Insufficient permissions"
            });
        }

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Doctor authorization error:", error);
        res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};
