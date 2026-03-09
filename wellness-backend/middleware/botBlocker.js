/**
 * Bot Blocker Middleware
 * 
 * Detects and blocks automated bot traffic by analyzing User-Agent headers
 * - Blocks requests from known bots, crawlers, and scanning tools
 * - Returns HTTP 403 with "Bot access denied" message
 * - Case-insensitive matching
 * - Minimal performance impact (~0.5ms per request)
 * 
 * Performance Note:
 * - Simple string matching is O(n) where n = number of blocked agents (~15-20)
 * - Total overhead less than 1ms per request
 * - Consider caching for very high traffic (100k+ req/sec)
 */

import { SECURITY_CONFIG, getClientIP } from '../config/securityConfig.js';

/**
 * Create regex pattern for bot detection
 * Case-insensitive matching
 */
const createBotPattern = () => {
    const agents = SECURITY_CONFIG.botDetection.blockedUserAgents;
    const pattern = agents.join('|');
    return new RegExp(pattern, 'i');
};

const botPattern = createBotPattern();

/**
 * Bot detection middleware
 * Checks User-Agent header against list of known bots
 */
export const botBlocker = (req, res, next) => {
    // Skip if bot detection is disabled
    if (!SECURITY_CONFIG.botDetection.enabled) {
        return next();
    }

    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIP(req);

    // Check if user-agent matches bot pattern
    if (botPattern.test(userAgent)) {
        // Log the bot attempt
        console.warn(`[BOT DETECTED] IP: ${ip} | User-Agent: ${userAgent} | URL: ${req.method} ${req.path}`);

        // Block the request
        return res.status(SECURITY_CONFIG.botDetection.statusCode).json({
            success: false,
            message: SECURITY_CONFIG.botDetection.message,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

/**
 * Enhanced bot detection with additional patterns
 * Can be used for specific routes requiring stricter validation
 */
export const strictBotBlocker = (req, res, next) => {
    if (!SECURITY_CONFIG.botDetection.enabled) {
        return next();
    }

    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIP(req);

    // Block empty user-agent
    if (!userAgent || userAgent.trim() === '') {
        console.warn(`[SUSPICIOUS REQUEST] Empty User-Agent from IP: ${ip} | URL: ${req.method} ${req.path}`);
        return res.status(400).json({
            success: false,
            message: 'Invalid request',
            timestamp: new Date().toISOString()
        });
    }

    // Block if user-agent matches known bot pattern
    if (botPattern.test(userAgent)) {
        console.warn(`[BOT DETECTED] IP: ${ip} | User-Agent: ${userAgent} | URL: ${req.method} ${req.path}`);
        return res.status(SECURITY_CONFIG.botDetection.statusCode).json({
            success: false,
            message: SECURITY_CONFIG.botDetection.message,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

/**
 * Get list of current blocked user agents
 * Useful for debugging or logging purposes
 */
export const getBlockedAgents = () => {
    return SECURITY_CONFIG.botDetection.blockedUserAgents;
};

/**
 * Add a new bot pattern to the blocklist
 * Updates the detection pattern dynamically
 */
export const addBotPattern = (pattern) => {
    if (!SECURITY_CONFIG.botDetection.blockedUserAgents.includes(pattern)) {
        SECURITY_CONFIG.botDetection.blockedUserAgents.push(pattern);
        // Recreate pattern
        botPattern = createBotPattern();
        console.log(`[BOT BLOCKER] Added new pattern: ${pattern}`);
    }
};

export default botBlocker;
