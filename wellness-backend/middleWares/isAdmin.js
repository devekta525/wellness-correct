/**
 * Authorization Middleware - Check if user is Admin
 * Verifies that the authenticated user has admin privileges
 * 
 * Usage:
 *   router.get('/admin-only', isLogin, isAdmin, controllerFunction);
 * 
 * Error Responses:
 *   - 401: Not authenticated
 *   - 403: Not authorized (not an admin)
 */

export const isAdmin = async (req, res, next) => {
    try {
        // User should be attached by isLogin middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if user has admin role
        const adminRoles = ["super_admin", "admin"];
        const userRole = req.user.role;

        if (!adminRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Admin access required. Insufficient permissions"
            });
        }

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Authorization error:", error);
        res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};

/**
 * Check if user is Super Admin
 * More restrictive - only super_admin role
 */
export const isSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                success: false,
                message: "Super admin access required"
            });
        }

        next();

    } catch (error) {
        console.error("Super admin authorization error:", error);
        res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};

/**
 * Check if user has specific role
 * @param {string|string[]} requiredRoles - Role(s) required to access the route
 */
export const hasRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            const userRole = req.user.role;

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role(s): ${roles.join(", ")}`
                });
            }

            next();

        } catch (error) {
            console.error("Role check error:", error);
            res.status(500).json({
                success: false,
                message: "Authorization check failed"
            });
        }
    };
};
