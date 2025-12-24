document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const categorySlug = params.get('slug');
    const searchQuery = params.get('q');
    
    let url = '/catalog/skus/';
    let title = 'Products';

    if (categorySlug) {
        url += `?category__slug=${categorySlug}`;
        title = categorySlug.replace(/-/g, ' ').toUpperCase();
    } else if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
        title = `Search: "${searchQuery}"`;
    }

    document.getElementById('page-title').innerText = title;
    await loadProducts(url);
});

async function loadProducts(url) {
    const grid = document.getElementById('product-grid');
    try {
        const response = await apiCall(url);
        const products = response.results || response;
        
        if (products.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="prod-card">
                <div class="prod-img-box">
                    <img src="${p.image_url || 'https://via.placeholder.com/150'}" class="prod-img">
                </div>
                <div class="prod-title">${p.name}</div>
                <div class="prod-unit">${p.unit}</div>
                <div class="prod-footer">
                    <div class="prod-price">₹${parseFloat(p.sale_price).toFixed(0)}</div>
                    <button class="prod-add-btn" onclick="addToCart('${p.id}', this)">ADD</button>
                </div>
                <a href="/product.html?code=${p.sku_code}" style="position:absolute; inset:0; z-index:1;"></a>
            </div>
        `).join('');
    } catch(e) {
        grid.innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

window.addToCart = async function(skuId, btn) {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    
    btn.innerText = '..';
    try {
        await apiCall('/orders/cart/add/', 'POST', { sku_id: skuId, quantity: 1 });
        btn.innerText = '✔';
        btn.style.background = '#27ae60';
        if(window.updateGlobalCartCount) window.updateGlobalCartCount();
        setTimeout(() => { btn.innerText = 'ADD'; btn.style.background = ''; }, 1500);
    } catch(e) { alert("Failed"); btn.innerText = 'ADD'; }
};