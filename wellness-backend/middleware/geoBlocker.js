/**
 * GeoIP Blocker Middleware
 * 
 * Geographic IP blocking based on country code
 * - Uses geoip-lite for IP geolocation (offline, no API calls)
 * - Allows only traffic from configured countries (default: India/IN)
 * - Blocks all other countries with HTTP 403
 * - Ignores localhost and private IP ranges
 * 
 * Performance Note:
 * - Lookup is O(1) in-memory operation
 * - Cached GeoIP database is loaded once at startup
 * - Overhead: ~1-2ms per request
 * - No network calls required (offline database)
 * 
 * Installation:
 *   npm install geoip-lite
 * 
 * Database Updates:
 *   npm update geoip-lite (updates GeoIP database)
 */

import geoip from 'geoip-lite';
import { SECURITY_CONFIG, getClientIP, isPrivateIP } from '../config/securityConfig.js';

/**
 * GeoIP blocking middleware
 * Blocks requests from countries outside allowed list
 */
export const geoBlocker = (req, res, next) => {
    // Skip if geo-blocking is disabled
    if (!SECURITY_CONFIG.geoBlocking.enabled) {
        return next();
    }

    // Skip if path is excluded
    if (SECURITY_CONFIG.geoBlocking.excludePaths.includes(req.path)) {
        return next();
    }

    const ip = getClientIP(req);

    // Check if IP is in exclude list
    if (SECURITY_CONFIG.geoBlocking.excludeIPs.includes(ip)) {
        return next();
    }

    // Check if IP is in private range (localhost, 192.168.x.x, etc.)
    if (isPrivateIP(ip)) {
        return next();
    }

    // Lookup country code for IP
    const geo = geoip.lookup(ip);

    // If geo lookup fails, allow request (assume legitimate)
    if (!geo) {
        console.warn(`[GEO LOOKUP] Failed to geolocate IP: ${ip}`);
        return next();
    }

    const countryCode = geo.country;

    // Check if country is in allowed list
    if (!SECURITY_CONFIG.geoBlocking.allowedCountries.includes(countryCode)) {
        console.warn(`[GEO BLOCKED] IP: ${ip} | Country: ${countryCode} | URL: ${req.method} ${req.path}`);

        return res.status(SECURITY_CONFIG.geoBlocking.statusCode).json({
            success: false,
            message: SECURITY_CONFIG.geoBlocking.message,
            timestamp: new Date().toISOString()
        });
    }

    // Request is allowed, attach geo data to request for logging
    req.geoInfo = {
        ip,
        country: countryCode,
        timezone: geo.timezone,
        coordinates: geo.ll // [longitude, latitude]
    };

    next();
};

/**
 * Get geolocation info for any IP address
 * Useful for debugging or analytics
 */
export const getGeoInfo = (ip) => {
    if (isPrivateIP(ip)) {
        return {
            ip,
            country: 'PRIVATE',
            timezone: 'PRIVATE',
            coordinates: null,
            note: 'Private IP - local network'
        };
    }

    const geo = geoip.lookup(ip);

    if (!geo) {
        return {
            ip,
            country: 'UNKNOWN',
            timezone: null,
            coordinates: null,
            note: 'Unable to determine location'
        };
    }

    return {
        ip,
        country: geo.country,
        city: geo.city || null,
        timezone: geo.timezone,
        coordinates: geo.ll, // [longitude, latitude]
        continent: geo.continent || null
    };
};

/**
 * Get allowed countries list
 */
export const getAllowedCountries = () => {
    return SECURITY_CONFIG.geoBlocking.allowedCountries;
};

/**
 * Add country to allowed list
 */
export const allowCountry = (countryCode) => {
    if (!SECURITY_CONFIG.geoBlocking.allowedCountries.includes(countryCode)) {
        SECURITY_CONFIG.geoBlocking.allowedCountries.push(countryCode.toUpperCase());
        console.log(`[GEO BLOCKER] Allowed country: ${countryCode}`);
    }
};

/**
 * Remove country from allowed list
 */
export const blockCountry = (countryCode) => {
    const index = SECURITY_CONFIG.geoBlocking.allowedCountries.indexOf(countryCode.toUpperCase());
    if (index > -1) {
        SECURITY_CONFIG.geoBlocking.allowedCountries.splice(index, 1);
        console.log(`[GEO BLOCKER] Blocked country: ${countryCode}`);
    }
};

export default geoBlocker;
