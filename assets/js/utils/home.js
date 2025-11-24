// assets/js/home.js

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});

async function loadCategories() {
    const container = document.querySelector('.categories');
    if(!container) return;

    try {
        // Backend se categories lao
        const categories = await apiCall('/catalog/categories/');
        
        container.innerHTML = categories.map(cat => `
            <a href="category.html?slug=${cat.slug}" class="category-card">
                <div class="category-icon">
                    ${cat.icon_url ? `<img src="${cat.icon_url}" width="40">` : '<i class="fas fa-shopping-basket"></i>'}
                </div>
                <h3>${cat.name}</h3>
            </a>
        `).join('');
    } catch (e) {
        console.error("Cat Load Error", e);
    }
}

async function loadProducts() {
    const grid = document.querySelector('.product-grid');
    if(!grid) return;

    try {
        // Backend se Active SKUs lao
        const products = await apiCall('/catalog/skus/');
        
        grid.innerHTML = products.map(p => {
            // Image URL fix (agar relative hai)
            const imgUrl = p.image_url ? p.image_url : 'https://via.placeholder.com/150?text=No+Image';
            
            return `
            <div class="product-card">
                <a href="product.html?code=${p.sku_code}">
                    <div class="product-image">
                        ${p.is_featured ? '<div class="discount-badge">Hot</div>' : ''}
                        <img src="${imgUrl}" alt="${p.name}">
                    </div>
                </a>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-weight">${p.unit}</div>
                    <div class="product-price">
                        <div class="price">₹${parseFloat(p.sale_price).toFixed(0)}</div>
                        <button class="add-to-cart" onclick="addToCart('${p.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch (e) {
        grid.innerHTML = '<p>Failed to load products.</p>';
    }
}

// Global Add to Cart Function (api.js ke saath accessible hona chahiye)
window.addToCart = async function(skuId) {
    if (!isLoggedIn()) {
        window.location.href = 'auth.html';
        return;
    }
    try {
        await apiCall('/orders/cart/add/', 'POST', { sku_id: skuId, quantity: 1 }, true);
        alert("Added to cart!");
        updateGlobalCartCount();
    } catch (e) {
        alert(e.message);
    }
};