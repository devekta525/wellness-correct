/**
 * Authorization Middleware - Check if user is Influencer
 * Verifies that the authenticated user has Influencer role
 * 
 * Usage:
 *   router.get('/influencer-only', isLogin, isInfluencer, controllerFunction);
 * 
 * Error Responses:
 *   - 401: Not authenticated
 *   - 403: Not authorized (not an influencer)
 */

export const isInfluencer = async (req, res, next) => {
    try {
        // User should be attached by isLogin middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if user has Influencer role (case-insensitive)
        const userRole = (req.user.role || "").toString().toLowerCase();
        if (userRole !== "influencer") {
            return res.status(403).json({
                success: false,
                message: "Influencer access required. Insufficient permissions"
            });
        }

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Influencer authorization error:", error);
        res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};
