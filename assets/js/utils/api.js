// assets/js/api.js

// Backend Base URL (Localhost)
const API_BASE = "http://127.0.0.1:8000/api/v1";
const MEDIA_URL = "http://127.0.0.1:8000"; // Images ke liye

// Common API Call Function
async function apiCall(endpoint, method = 'GET', body = null, requireAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Token Attach Logic
    if (requireAuth) {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Agar auth chahiye par token nahi hai, login par bhejo
            window.location.href = 'auth.html';
            return;
        }
    }

    const config = {
        method: method,
        headers: headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // 401 Unauthorized (Token Expired) handling
        if (response.status === 401 && requireAuth) {
            logout();
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || data.error || "Something went wrong");
        }
        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

// User Login Status Check
function isLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

// Logout Helper
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
}

// Cart Count Update (Har page par chalega)
async function updateGlobalCartCount() {
    const cartCountEl = document.querySelector('.cart-count');
    if (!cartCountEl || !isLoggedIn()) return;

    try {
        const cart = await apiCall('/orders/cart/', 'GET', null, true);
        // Items ki quantity ka total
        const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cartCountEl.innerText = count;
        cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    } catch (e) {
        console.log("Cart fetch failed (silent)", e);
    }
}

// Page load par cart update
document.addEventListener('DOMContentLoaded', updateGlobalCartCount);