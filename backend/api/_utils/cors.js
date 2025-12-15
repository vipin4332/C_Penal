/**
 * CORS Utility
 * Adds CORS headers to API responses
 */

function addCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

function handleOptions(req, res) {
    addCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
}

module.exports = {
    addCorsHeaders,
    handleOptions
};

