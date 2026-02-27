/**
 * Authorization Middleware - Check if user is Customer
 * Verifies that the authenticated user has Customer role
 * 
 * Usage:
 *   router.get('/customer-only', isLogin, isCustomer, controllerFunction);
 * 
 * Error Responses:
 *   - 401: Not authenticated
 *   - 403: Not authorized (not a customer)
 */

export const isCustomer = async (req, res, next) => {
    try {
        // User should be attached by isLogin middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if user has Customer role (case-insensitive)
        const userRole = (req.user.role || "").toString().toLowerCase();
        if (userRole !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Customer access required. Insufficient permissions"
            });
        }

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Customer authorization error:", error);
        res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};
