import jwt from "jsonwebtoken";

if (!process.env.JWT_TOKEN) {
  console.warn("⚠️  JWT_TOKEN is not defined in environment variables. Token generation will fail.");
}

/**
 * Generate JWT token with user information
 * @param {string} id - User ID
 * @param {string} role - User role (Admin, Doctor, Influencer, Customer)
 * @param {string} [adminRole] - Admin-specific role (super_admin, admin, moderator) - only if role is "Admin"
 * @returns {string} JWT token
 */
export default function generateToken(id, role = "Customer", adminRole = null) {
  const payload = {
    id,
    role,
  };

  // Include adminRole if user is an Admin
  if (role === "Admin" && adminRole) {
    payload.adminRole = adminRole;
  }

  return jwt.sign(payload, process.env.JWT_TOKEN, { expiresIn: "1d" });
}