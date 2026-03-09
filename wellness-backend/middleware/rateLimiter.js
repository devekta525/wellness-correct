/**
 * Rate Limiter Middleware
 * 
 * Implements IP-based rate limiting using express-rate-limit
 * - Limits each IP to configurable requests per time window
 * - Returns HTTP 429 when limit exceeded
 * - Stores rate limit data in memory (suitable for single-server deployments)
 * - For distributed deployments, use Redis store: npm install rate-limit-redis
 * 
 * Performance Note:
 * - Memory-based store is O(1) operation per request
 * - Minimal overhead (~1ms per request)
 * - Consider Redis for high-traffic multi-server deployments
 */

import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG, getClientIP } from '../config/securityConfig.js';

/**
 * Global rate limiter - applies to all routes
 * Limits: 200 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
    windowMs: SECURITY_CONFIG.rateLimiting.windowMs,
    max: SECURITY_CONFIG.rateLimiting.maxRequests,
    message: SECURITY_CONFIG.rateLimiting.message,
    statusCode: SECURITY_CONFIG.rateLimiting.statusCode,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Extract real client IP (handles proxies)
    keyGenerator: (req) => getClientIP(req),
    // Skip rate limiting for certain paths
    skip: (req) => {
        return SECURITY_CONFIG.rateLimiting.excludePaths.includes(req.path);
    },
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
        res.status(SECURITY_CONFIG.rateLimiting.statusCode).json({
            success: false,
            message: SECURITY_CONFIG.rateLimiting.message,
            retryAfter: req.rateLimit.resetTime ?
                Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 'unknown'
        });
    }
});

/**
 * Strict rate limiter for sensitive endpoints (login, registration)
 * Limits: 5 requests per 15 minutes
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts, please try again later.',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again after 15 minutes.',
            retryAfter: req.rateLimit.resetTime ?
                Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 'unknown'
        });
    }
});

/**
 * Very strict limiter for API key generation or password reset (3 per hour)
 */
export const veryStrictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again after 1 hour.',
            retryAfter: req.rateLimit.resetTime ?
                Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : 'unknown'
        });
    }
});

/**
 * Lenient limiter for read-only public endpoints (500 per 15 minutes)
 */
export const lenientLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    skip: (req) => {
        return SECURITY_CONFIG.rateLimiting.excludePaths.includes(req.path);
    }
});

export default globalLimiter;
