/**
 * API Configuration
 * Backend URL for API calls
 */

// Vercel backend URL - Your project: c-penal
// If this doesn't work, check your Vercel dashboard for the exact URL
const BACKEND_URL = 'https://c-penal.vercel.app';

// Get API URL - automatically handles backend URL
function getApiUrl(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // If BACKEND_URL is configured, use it
    if (BACKEND_URL && BACKEND_URL !== 'https://your-backend-url.vercel.app') {
        return `${BACKEND_URL}/${cleanEndpoint}`;
    }
    
    // Fallback: try to detect or use relative path
    // For GitHub Pages, this will need the actual backend URL
    return `/${cleanEndpoint}`;
}
