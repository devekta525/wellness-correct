/**
 * Security Middleware - Usage Examples
 * 
 * This file demonstrates how to use the security middleware
 * and take advantage of runtime configuration options.
 * 
 * Copy and adapt these examples to your needs.
 */

// ============================================================================
// EXAMPLE 1: Basic Setup (Already done in app.js)
// ============================================================================
import express from 'express';
import helmet from 'helmet';
import { globalLimiter, strictLimiter } from './middleware/rateLimiter.js';
import { botBlocker } from './middleware/botBlocker.js';
import { geoBlocker } from './middleware/geoBlocker.js';
import { requestLogger } from './middleware/requestLogger.js';
import { ddosProtection } from './middleware/ddosProtection.js';

const app = express();

// Apply security middleware
app.use(helmet());
app.use(requestLogger);
app.use(ddosProtection);
app.use(botBlocker);
app.use(geoBlocker);
app.use(globalLimiter);

// Stricter protection for auth
app.use('/v1/auth', strictLimiter);

// ============================================================================
// EXAMPLE 2: Advanced DDoS Protection Management
// ============================================================================
import {
    blacklistIP,
    unblacklistIP,
    whitelistIP,
    removeWhitelistIP,
    getBlacklistedIPs,
    getIPRequestInfo,
    getDDoSStats
} from './middleware/ddosProtection.js';

// Manually blacklist a malicious IP (e.g., from your monitoring system)
export async function blockMaliciousIP(ip) {
    blacklistIP(ip, 60 * 60 * 1000); // Blacklist for 1 hour
    console.log(`Blocked: ${ip}`);
}

// Whitelist a CDN or trusted service
export function trustCDN(cdnIP) {
    whitelistIP(cdnIP);
    console.log(`Whitelisted: ${cdnIP}`);
}

// Check if an IP is suspicious
export function checkIPStatus(ip) {
    const info = getIPRequestInfo(ip);
    console.log(`IP ${ip} status:`, info);

    if (info.status === 'SUSPICIOUS') {
        console.warn(`⚠️  WARNING: ${ip} is making suspicious requests`);
        blacklistIP(ip);  // Auto-blacklist suspicious IPs
    }
}

// Get current DDoS protection statistics
export function getDDoSStatus() {
    const stats = getDDoSStats();
    console.log('DDoS Protection Status:', stats);

    if (stats.blacklistedIPs > 10) {
        console.warn('⚠️  High number of blacklisted IPs - possible attack');
    }
}

// ============================================================================
// EXAMPLE 3: Dynamic Bot Detection Configuration
// ============================================================================
import {
    addBotPattern,
    getBlockedAgents,
    strictBotBlocker
} from './middleware/botBlocker.js';

// Add custom bot patterns at runtime
export function configureCustomBots() {
    addBotPattern('maliciousbot');
    addBotPattern('mycompanybot');
    addBotPattern('scanner');
}

// Get current blocked user agents
export function getBlockedBots() {
    const agents = getBlockedAgents();
    console.log('Currently blocked user-agents:', agents);
    return agents;
}

// Use stricter bot detection for sensitive endpoints
import apiRouter from './routes/apiRoute.js';
app.use('/v1/admin', strictBotBlocker, apiRouter);

// ============================================================================
// EXAMPLE 4: GeoIP Configuration & Control
// ============================================================================
import {
    geoBlocker,
    allowCountry,
    blockCountry,
    getGeoInfo,
    getAllowedCountries
} from './middleware/geoBlocker.js';

// Allow additional countries
export function expandRegionalAccess() {
    allowCountry('US');   // United States
    allowCountry('UK');   // United Kingdom
    allowCountry('CA');   // Canada
    allowCountry('AU');   // Australia
}

// Revoke access to a country
export function blockCountryAccess(countryCode) {
    blockCountry(countryCode);
    console.log(`Blocked access from: ${countryCode}`);
}

// Check which countries are currently allowed
export function getActiveCountries() {
    const countries = getAllowedCountries();
    console.log('Allowed countries:', countries);
    return countries;
}

// Get geolocation info for debugging
export function checkUserLocation(ip) {
    const geoInfo = getGeoInfo(ip);
    console.log(`IP ${ip} location:`, geoInfo);
    return geoInfo;
}

// Use different geo-blocking for different routes
app.use('/v1/public', geoBlocker);  // All countries must be in whitelist
app.use('/v1/paid', (req, res, next) => {
    // Custom geo-blocking for paid content (could allow more countries)
    next();
});

// ============================================================================
// EXAMPLE 5: Request Logging & Analysis
// ============================================================================
import {
    getRecentLogs,
    clearAllLogs
} from './middleware/requestLogger.js';

// Get recent logs for analysis
export function analyzeTraffic() {
    const recentLogs = getRecentLogs('all', 100);

    // Analyze traffic patterns
    const statusCodes = {};
    const methods = {};

    recentLogs.forEach(log => {
        if (log.status) {
            statusCodes[log.status] = (statusCodes[log.status] || 0) + 1;
            methods[log.method] = (methods[log.method] || 0) + 1;
        }
    });

    console.log('Recent Traffic Analysis:', {
        statusCodes,
        methods,
        totalRequests: recentLogs.length
    });

    return { statusCodes, methods };
}

// Get attack patterns
export function getAttackPatterns() {
    const suspiciousLogs = getRecentLogs('suspicious', 50);

    if (suspiciousLogs.length > 0) {
        console.warn('⚠️  Detected potential attacks:');
        suspiciousLogs.forEach(log => {
            console.log(`  - ${log.ip} attempted: ${log.url}`);
        });
    }

    return suspiciousLogs;
}

// Get blocked requests
export function getBlockedRequests() {
    const blockedLogs = getRecentLogs('blocked', 100);

    const blockedBy = {};
    blockedLogs.forEach(log => {
        const reason = log.reason || 'Unknown';
        blockedBy[reason] = (blockedBy[reason] || 0) + 1;
    });

    console.log('Blocked Requests Summary:', blockedBy);
    return { count: blockedLogs.length, breakdown: blockedBy };
}

// Cleanup old logs (call periodically)
export function cleanupLogs() {
    clearAllLogs();
    console.log('Old logs cleared');
}

// ============================================================================
// EXAMPLE 6: Admin Dashboard Endpoints
// ============================================================================

// Dashboard endpoint (add authentication in production!)
app.get('/api/admin/dashboard', isAdmin, (req, res) => {
    const ddosStats = getDDoSStats();
    const trafficAnalysis = analyzeTraffic();
    const attacks = getAttackPatterns();
    const blacklist = getBlacklistedIPs();

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        security: {
            ddos: ddosStats,
            traffic: trafficAnalysis,
            attacks: attacks.length,
            blacklistedIPs: blacklist.length
        }
    });
});

// Detailed security report
app.get('/api/admin/security-report', isAdmin, (req, res) => {
    const report = {
        timestamp: new Date().toISOString(),
        ddosProtection: getDDoSStats(),
        blockedRequests: getBlockedRequests(),
        allowedCountries: getAllowedCountries(),
        blockedBots: getBlockedBots(),
        recentAttacks: getAttackPatterns()
    };

    res.json({ success: true, report });
});

// ============================================================================
// EXAMPLE 7: Incident Response - Auto-response to attacks
// ============================================================================

// Automatic incident response system
export class IncidentResponse {
    static checkAndRespond() {
        const stats = getDDoSStats();
        const attacked = getAttackPatterns();

        // Escalate if many IPs blacklisted
        if (stats.blacklistedIPs > 20) {
            console.error('🚨 ALERT: Massive attack detected!');
            this.notifySecurityTeam('Possible DDoS attack');
        }

        // Escalate if many attack patterns
        if (attacked.length > 10) {
            console.error('🚨 ALERT: Multiple attack patterns detected!');
            this.notifySecurityTeam('Possible multi-vector attack');
        }

        // Alert on false positive spam (many rate-limit blocks)
        const blocked = getBlockedRequests();
        if (blocked.count > 1000) {
            console.warn('⚠️  WARNING: Possible false positive spam');
            // Review and adjust rate limiting if needed
        }
    }

    static notifySecurityTeam(message) {
        // Send alert via email, Slack, PagerDuty, etc.
        console.log(`[SECURITY ALERT] ${message}`);
        // TODO: Implement actual notification system
        // sendSlackAlert(message);
        // sendEmailAlert(message);
    }
}

// Run incident response check every 5 minutes
setInterval(() => {
    IncidentResponse.checkAndRespond();
}, 5 * 60 * 1000);

// ============================================================================
// EXAMPLE 8: Custom Rate Limiters for Specific Routes
// ============================================================================
import {
    strictLimiter,
    veryStrictLimiter,
    lenientLimiter
} from './middleware/rateLimiter.js';

// Create routes with custom rate limits
const authRouter = express.Router();

// Strict: 5 attempts per 15 minutes
authRouter.post('/login', strictLimiter, (req, res) => {
    // Login logic
});

// Very strict: 3 attempts per hour
authRouter.post('/reset-password', veryStrictLimiter, (req, res) => {
    // Reset password logic
});

app.use('/v1/auth', authRouter);

// Lenient: 500 requests per 15 minutes for public endpoints
const publicRouter = express.Router();
publicRouter.get('/public-data', lenientLimiter, (req, res) => {
    // Public data logic
});

app.use('/v1/public', publicRouter);

// ============================================================================
// EXAMPLE 9: Performance Monitoring
// ============================================================================

// Track security middleware performance
let middlewareMetrics = {
    totalRequests: 0,
    blockedByRateLimit: 0,
    blockedByBot: 0,
    blockedByGeo: 0,
    blockedByDDoS: 0
};

// Middleware to track blocks
app.use((req, res, next) => {
    middlewareMetrics.totalRequests++;

    const originalJSON = res.json;
    res.json = function (data) {
        if (res.statusCode === 429) {
            middlewareMetrics.blockedByRateLimit++;
        } else if (res.statusCode === 403 && data?.message?.includes('Bot')) {
            middlewareMetrics.blockedByBot++;
        } else if (res.statusCode === 403 && data?.message?.includes('country')) {
            middlewareMetrics.blockedByGeo++;
        } else if (res.statusCode === 429 && data?.message?.includes('Too many')) {
            middlewareMetrics.blockedByDDoS++;
        }
        return originalJSON.call(this, data);
    };

    next();
});

// Get performance metrics
app.get('/api/admin/metrics', isAdmin, (req, res) => {
    res.json({
        success: true,
        metrics: middlewareMetrics,
        blockRate: (
            (middlewareMetrics.blockedByRateLimit +
                middlewareMetrics.blockedByBot +
                middlewareMetrics.blockedByGeo +
                middlewareMetrics.blockedByDDoS) /
            middlewareMetrics.totalRequests * 100
        ).toFixed(2) + '%'
    });
});

// ============================================================================
// EXAMPLE 10: Testing & Debugging Utilities
// ============================================================================

/**
 * Test security middleware
 */
export async function testSecurityMiddleware() {
    console.log('\n🧪 Security Middleware Test Suite\n');

    // Test 1: Rate limiting
    console.log('Test 1: Rate Limiting');
    console.log('Expected: 200 requests succeed, 201st fails');
    console.log('Run: for i in {1..201}; do curl http://localhost:5000; done\n');

    // Test 2: Bot detection
    console.log('Test 2: Bot Detection');
    console.log('Expected: curl request blocked');
    console.log('Run: curl -A "curl/7.68.0" http://localhost:5000\n');

    // Test 3: GeoIP blocking
    console.log('Test 3: GeoIP Blocking');
    console.log('Expected: Access from non-India IP blocked');
    console.log('Run from outside India: curl http://localhost:5000\n');

    // Test 4: DDoS protection
    console.log('Test 4: DDoS Protection');
    console.log('Expected: 50+ requests in 10s from same IP blocked');
    console.log('Run: ab -n 60 -c 1 http://localhost:5000\n');

    // Test 5: Logging
    console.log('Test 5: Request Logging');
    console.log('Expected: logs/requests.log contains request');
    console.log('Run: tail -f logs/requests.log\n');
}

export default app;
