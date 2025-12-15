/**
 * API Configuration
 * Update BACKEND_URL with your Vercel backend URL
 */

// Replace this with your Vercel backend URL
// Example: https://c-penal-backend.vercel.app
// Or: https://your-project-name.vercel.app
const BACKEND_URL = 'https://your-backend-url.vercel.app';

// Get API URL
function getApiUrl(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${BACKEND_URL}/${cleanEndpoint}`;
}

