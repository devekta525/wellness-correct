/**
 * Security Configuration
 * Centralized security settings for all protection mechanisms
 * 
 * This file contains all configurable parameters for rate limiting,
 * bot detection, geo-blocking, and DDoS protection.
 */

export const SECURITY_CONFIG = {
    // Rate Limiting Configuration
    rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 200, // Max 200 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        statusCode: 429,
        // Paths that are excluded from rate limiting (e.g., login attempts might need higher limits)
        excludePaths: [
            '/v1/auth/register',
            '/v1/auth/login',
            '/v1/newsletters/subscribe',
            '/health',
            '/'
        ],
        // Custom limits for specific routes (can override global limits)
        routeLimits: {
            '/v1/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 min
            '/v1/auth/register': { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
        }
    },

    // Bot Detection Configuration
    botDetection: {
        enabled: true,
        blockedUserAgents: [
            'curl',
            'wget',
            'python',
            'scrapy',
            'bot',
            'crawler',
            'spider',
            'httpclient',
            'semrush',
            'ahrefs',
            'nikto',
            'nessus',
            'nmap',
            'masscan',
            'sqlmap'
        ],
        message: 'Bot access denied',
        statusCode: 403,
        caseSensitive: false // Match user-agent case-insensitively
    },

    // GeoIP Protection Configuration
    geoBlocking: {
        enabled: true,
        allowedCountries: ['IN'], // Only India allowed
        message: 'Access from your country is not permitted',
        statusCode: 403,
        // IPs/ranges to exclude from geo-blocking
        excludeIPs: [
            '127.0.0.1',
            '::1',
            // Private IP ranges are automatically excluded
        ],
        // Paths excluded from geo-blocking (e.g., public health check)
        excludePaths: [
            '/health',
            '/'
        ]
    },

    // Request Logging Configuration
    requestLogging: {
        enabled: true,
        logDir: './logs',
        logFile: 'requests.log',
        suspiciousLogFile: 'suspicious-requests.log',
        blockedLogFile: 'blocked-requests.log',
        maxLogSize: 10 * 1024 * 1024, // 10MB per log file
        maxLogs: 3, // Keep 3 rotated logs
        // Fields to log from each request
        logFields: ['ip', 'method', 'url', 'status', 'userAgent', 'timestamp', 'duration', 'userId']
    },

    // DDoS Protection Configuration
    ddosProtection: {
        enabled: true,
        threshold: 50, // Threshold for requests
        timeWindow: 10 * 1000, // 10 seconds
        blockDuration: 10 * 60 * 1000, // 10 minutes (600 seconds)
        message: 'Too many requests. Your IP has been temporarily blocked.',
        statusCode: 429,
        // IPs to whitelist (never block regardless of request count)
        whitelistIPs: [
            '127.0.0.1',
            '::1'
        ]
    },

    // Helmet Security Headers Configuration
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        frameguard: { action: 'deny' },
        xssFilter: true,
        noSniff: true,
        referrerPolicy: { policy: 'no-referrer' },
    },

    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || true,
        credentials: true,
        optionsSuccessStatus: 200
    },

    // Request Size Limits
    requestLimits: {
        json: '50mb',
        urlencoded: '50mb'
    }
};

/**
 * Helper function to check if IP is in private range
 * Handles IPv4 and IPv6 private addresses
 */
export const isPrivateIP = (ip) => {
    if (!ip) return false;

    // IPv4 private ranges
    const ipv4PrivateRanges = [
        /^127\./, // 127.0.0.0/8
        /^10\./, // 10.0.0.0/8
        /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
        /^192\.168\./, // 192.168.0.0/16
        /^169\.254\./, // 169.254.0.0/16
    ];

    // IPv6 private ranges
    const ipv6PrivateRanges = [
        /^::1$/, // Loopback
        /^fe80:/, // Link-local
        /^fc00:|^fd00:/ // Unique local addresses
    ];

    // Check IPv4 private ranges
    for (const range of ipv4PrivateRanges) {
        if (range.test(ip)) return true;
    }

    // Check IPv6 private ranges
    for (const range of ipv6PrivateRanges) {
        if (range.test(ip)) return true;
    }

    return false;
};

/**
 * Helper function to extract real client IP
 * Handles proxies and load balancers
 */
export const getClientIP = (req) => {
    // Check for IP from proxies
    if (req.headers['x-forwarded-for']) {
        return req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    if (req.headers['x-real-ip']) {
        return req.headers['x-real-ip'];
    }
    if (req.headers['cf-connecting-ip']) {
        return req.headers['cf-connecting-ip'];
    }
    // Fallback to direct connection IP
    return req.ip || req.connection.remoteAddress;
};

export default SECURITY_CONFIG;
