(function() {
    function safeJsonParse(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    }

    window.APP_CONFIG = {
        // IMPORTANT: Update this to match your Django server URL
        API_BASE: "http://127.0.0.1:8000/api/v1", 
        
        USER: safeJsonParse('user'),
        IS_LOGGED_IN: !!localStorage.getItem('access_token'),
        
        URLS: {
            HOME: '/index.html',
            LOGIN: '/auth.html',
            CART: '/cart.html',
            SEARCH: '/search_results.html',
            PROFILE: '/profile.html'
        }
    };

    // Backward compatibility for older scripts
    window.API_BASE = window.APP_CONFIG.API_BASE;
})();