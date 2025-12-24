/* static/assets/js/utils/base.js */

// Global Utils exposed to window
window.bindNavbarLocationClick = function() {
    const navLocBtn = document.getElementById('navbar-location-box');
    if (navLocBtn) {
        navLocBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.LocationPicker) {
                LocationPicker.open();
            } else {
                console.error("LocationPicker module not loaded");
            }
        });
    }
}

window.loadNavbarCategories = async function() {
    const nav = document.getElementById('dynamic-navbar');
    if (!nav) return;
    
    try {
        const response = await apiCall('/catalog/categories/?page_size=100', 'GET', null, false);
        const allCategories = response.results || response;
        const parentCategories = allCategories.filter(c => !c.parent);
        
        nav.innerHTML = '<a href="/index.html" class="nav-item">All</a>';

        parentCategories.forEach(cat => {
            const link = document.createElement('a');
            link.href = `/search_results.html?slug=${cat.slug}`;
            link.className = 'nav-item';
            link.innerText = cat.name;
            nav.appendChild(link);
        });
    } catch (error) { 
        console.warn("[Navbar] Failed to load categories", error); 
    }
}

window.initGlobalLocationWidget = async function() {
    const locText = document.getElementById('header-location');
    if (!locText) return;

    const savedAddress = localStorage.getItem('user_address_text');
    if (savedAddress) {
        locText.innerText = savedAddress;
        return;
    }

    if (window.APP_CONFIG && window.APP_CONFIG.IS_LOGGED_IN) {
        try {
            const response = await apiCall('/auth/customer/addresses/');
            const addresses = response.results || response;
            const defaultAddr = addresses.find(a => a.is_default) || addresses[0];

            if (defaultAddr && defaultAddr.city) {
                const displayText = defaultAddr.address_text || defaultAddr.city;
                locText.innerText = displayText;
                localStorage.setItem('user_address_text', displayText);
            }
        } catch (e) {
            console.warn("[LocationWidget] Address fetch failed", e);
        }
    }
}

window.updateGlobalCartCount = async function () {
    const badge = document.getElementById('nav-cart-count');
    if (!badge) return;

    if (!window.APP_CONFIG || !window.APP_CONFIG.IS_LOGGED_IN) {
        badge.innerText = '0';
        badge.style.display = 'none';
        return;
    }

    try {
        const cart = await apiCall('/orders/cart/');
        const count = cart.items ? cart.items.length : 0;
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (e) {
        console.warn("[Cart] Count update failed", e);
        badge.style.display = 'none';
    }
};