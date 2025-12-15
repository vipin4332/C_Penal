/**
 * API Configuration
 * Set your Vercel backend URL below
 */

// IMPORTANT: Replace with your actual Vercel backend URL
// Find it in: Vercel Dashboard → Your Project → Overview (top of page)
// Example: https://c-penal-backend.vercel.app
const BACKEND_URL = 'https://c-penal-backend.vercel.app';

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
