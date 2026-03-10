/**
 * Lightweight HTTP/HTTPS helper for calling external APIs.
 * Works on all Node.js versions without extra packages.
 */
const https = require('https');
const http = require('http');
const { URL } = require('url');

const httpRequest = ({ url, method = 'GET', headers = {}, body = null, timeout = 15000 }) => {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const protocol = u.protocol === 'https:' ? https : http;
    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;

    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      timeout,
    };

    if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: parsed, status: res.statusCode });
          } else {
            const errMsg = parsed.message || parsed.error?.description || parsed.error_description || parsed.error || 'Request failed';
            const err = new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
            err.status = res.statusCode;
            err.response = parsed;
            reject(err);
          }
        } catch {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data, status: res.statusCode });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
};

module.exports = httpRequest;
