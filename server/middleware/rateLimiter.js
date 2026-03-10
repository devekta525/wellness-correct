const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  });

const isDev = process.env.NODE_ENV !== 'production';
const authLimiter = createLimiter(15 * 60 * 1000, isDev ? 200 : 20, 'Too many login attempts, please try again after 15 minutes');
const apiLimiter = createLimiter(15 * 60 * 1000, isDev ? 5000 : 500, 'Too many requests, please try again later');
const strictLimiter = createLimiter(60 * 60 * 1000, isDev ? 200 : 10, 'Too many attempts, please try again after an hour');

module.exports = { authLimiter, apiLimiter, strictLimiter };
