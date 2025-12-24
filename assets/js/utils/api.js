const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) ? window.APP_CONFIG.API_BASE : '/api/v1';

async function apiCall(endpoint, method = 'GET', body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    
    if (auth) {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        // Handle Absolute vs Relative URLs
        let url = endpoint;
        if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
            const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            url = `${API_BASE}${safeEndpoint}`;
        }

        const response = await fetch(url, config);
        
        // Handle 401 Unauthorized (Session Expired)
        if (response.status === 401 && auth) {
            console.warn("Session expired.");
            localStorage.clear();
            window.location.href = '/auth.html';
            throw new Error("Unauthorized - Session Expired");
        }

        const data = await response.json();
        
        if (!response.ok) {
            const errorMessage = data.detail || data.error || (data.non_field_errors ? data.non_field_errors[0] : 'Something went wrong');
            throw new Error(errorMessage);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}