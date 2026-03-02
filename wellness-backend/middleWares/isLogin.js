import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isLogin = async (req, res, next) => {
  try {
    // If a previous middleware already authenticated the user, skip
    if (req.user) {
      return next();
    }

    let token;

    // 1. Check for Bearer token in Authorization header (standard method)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      if (process.env.NODE_ENV === 'development') {
        console.debug("isLogin: token found in Authorization header");
      }
    }
    // 1b. some clients send the token in a custom header
    else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
      if (process.env.NODE_ENV === 'development') {
        console.debug("isLogin: token found in x-access-token header");
      }
    }
    // 2. Fallback to token query parameter (useful for websocket or legacy links)
    else if (req.query && req.query.token) {
      token = req.query.token;
      if (process.env.NODE_ENV === 'development') {
        console.debug("isLogin: token found in query string");
      }
    }
    // 3. Fallback to check for token in cookies (as per README)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      if (process.env.NODE_ENV === 'development') {
        console.debug("isLogin: token found in cookies");
      }
    }

    // 4. If no token is found anywhere, return 401
    if (!token) {
      console.warn("isLogin: no token provided in headers, query string, or cookies");
      return res.status(401).json({
        success: false,
        message: "Could not find authentication token. Please log in again.",
      });
    }

    // 4. Verify the token
    // IMPORTANT: Ensure process.env.JWT_TOKEN is the same secret used during token generation (in utils/generateToken.js)
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    if (process.env.NODE_ENV === 'development') {
      console.debug("isLogin: token signature verified for user ID", decoded.id || decoded._id);
    }

    // 5. Find user in DB and attach to the request object
    const user = await User.findById(decoded.id || decoded._id).select("-password");

    if (!user) {
      console.warn("isLogin: token valid but user record not found; id=", decoded.id || decoded._id);
      return res.status(401).json({ success: false, message: "User associated with this token no longer exists." });
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(`isLogin: authenticated ${user.email} (${user._id})`);
    }
    req.user = user;
    next();

  } catch (error) {
    console.error("❌ isLogin Middleware Error:", error.message);
    // Provide a more specific error message for common JWT errors
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