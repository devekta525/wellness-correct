/**
 * JWT Authentication Middleware - Lightweight JWT verification without DB lookup
 * Decodes the JWT and attaches decoded payload to req.jwtPayload
 * Use this when you only need to check role from JWT (faster, no DB query)
 * 
 * Usage for lightweight role checks:
 *   router.get('/fast-route', isAuth, (req, res) => { 
 *     if (req.jwtPayload.role !== 'Admin') return res.status(403).json({...})
 *     // continue processing
 *   });
 * 
 * Error Responses:
 *   - 401: No token provided or invalid/expired token
 */

import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
    try {
        let token;

        // 1. Check for Bearer token in Authorization header (standard method)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        // 1b. Custom header
        else if (req.headers['x-access-token']) {
            token = req.headers['x-access-token'];
        }
        // 2. Query parameter
        else if (req.query && req.query.token) {
            token = req.query.token;
        }
        // 3. Cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // If no token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token provided"
            });
        }

        // Verify and decode JWT
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);

        // Attach decoded payload (includes id, role, adminRole)
        req.jwtPayload = decoded;

        next();

    } catch (error) {
        console.error("isAuth error:", error.message);

        let message = "Authentication failed: Invalid or expired token.";
        if (error.name === 'JsonWebTokenError') {
            message = 'Authentication failed: Malformed token.';
        } else if (error.name === 'TokenExpiredError') {
            message = 'Authentication failed: Token has expired.';
        }

        return res.status(401).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Quick role check using only JWT (no DB lookup)
 * @param {string|string[]} requiredRoles - Role(s) required
 * @returns {Function} Middleware function
 */
export const hasRoleFromJWT = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.jwtPayload) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            const userRole = req.jwtPayload.role;

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role(s): ${roles.join(", ")}`
                });
            }

            next();

        } catch (error) {
            console.error("JWT role check error:", error);
            res.status(500).json({
                success: false,
                message: "Authorization check failed"
            });
        }
    };
};
