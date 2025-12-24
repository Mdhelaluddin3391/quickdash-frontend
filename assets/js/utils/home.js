let homeFeedPage = 1;
let isFeedLoading = false;
let hasMoreFeed = true;
let cartMap = {}; 

document.addEventListener('DOMContentLoaded', async () => {
    await fetchCartState();
    
    // Load static sections in parallel
    Promise.all([loadBanners(), loadHomeCategories(), loadFlashSales(), loadBrands()]);
    
    initProductShelves();
});

async function fetchCartState() {
    if (!localStorage.getItem('access_token')) return;
    try {
        const response = await apiCall('/orders/cart/', 'GET', null, true);
        const cartItems = response.items || [];
        cartMap = {};
        cartItems.forEach(item => {
            const skuId = item.sku ? item.sku.id : item.sku_id;
            cartMap[skuId] = item.quantity;
        });
    } catch (e) {}
}

async function loadBanners() {
    const slider = document.getElementById('hero-slider');
    if (!slider) return;
    try {
        const response = await apiCall('/catalog/banners/');
        const banners = response.results || response;
        if(banners.length > 0) {
            slider.innerHTML = banners.filter(b => b.position === 'HERO').map(b => `
                <a href="${b.target_url || '#'}" class="promo-card" style="background: ${b.bg_gradient || '#333'}">
                    <div class="promo-content"><h2>${b.title}</h2><p>Shop Now</p></div>
                    <img src="${b.image_url}" class="promo-img">
                </a>`).join('');
        }
    } catch (e) {}
}

async function loadHomeCategories() {
    const grid = document.getElementById('home-category-grid');
    if (!grid) return;
    try {
        const response = await apiCall('/catalog/categories/?page_size=8');
        grid.innerHTML = (response.results || response).map(c => `
            <div class="cat-item-home" onclick="window.location.href='/search_results.html?slug=${c.slug}'">
                <div class="cat-icon-box"><img src="${c.icon_url || 'https://via.placeholder.com/50'}"></div>
                <span class="cat-label">${c.name}</span>
            </div>`).join('');
    } catch (e) {}
}

async function loadFlashSales() {
    const grid = document.getElementById('flash-sale-grid');
    const section = document.getElementById('flash-sale-section');
    if (!grid) return;
    try {
        const response = await apiCall('/catalog/flash-sales/');
        const sales = response.results || response;
        if (sales.length === 0) { section.style.display = 'none'; return; }
        
        section.style.display = 'block';
        grid.innerHTML = sales.map(sale => `
            <div class="flash-card">
                <div class="badge-off">${sale.discount_percent}% OFF</div>
                <img src="${sale.sku_image}">
                <div class="f-info">${sale.sku_name}</div>
                <div class="price"><span>₹${parseInt(sale.discounted_price)}</span> <small>₹${parseInt(sale.original_price)}</small></div>
                <button onclick="addToCart('${sale.sku_id}', 1, this)" style="width:100%;margin-top:5px;border:none;background:#e67e22;color:white;border-radius:4px;">ADD</button>
            </div>`).join('');
    } catch (e) { section.style.display = 'none'; }
}

async function loadBrands() {
    const scroller = document.getElementById('brand-scroller');
    if(!scroller) return;
    try {
        const response = await apiCall('/catalog/brands/');
        scroller.innerHTML = (response.results || response).map(b => `
            <div class="brand-circle" onclick="window.location.href='/search_results.html?q=${b.name}'">
                <img src="${b.logo_url}">
            </div>`).join('');
    } catch(e){}
}

async function initProductShelves() {
    loadNextFeedBatch();
}

async function loadNextFeedBatch() {
    if (isFeedLoading || !hasMoreFeed) return;
    isFeedLoading = true;
    const container = document.getElementById('dynamic-sections-container');
    const loader = document.getElementById('shelves-loader');
    
    try {
        const response = await apiCall(`/catalog/api/home/feed/?page=${homeFeedPage}`);
        hasMoreFeed = response.has_more;
        homeFeedPage = response.next_page;
        
        if (loader) loader.remove();

        response.sections.forEach(section => {
            const html = `
                <section class="category-section">
                    <div class="section-header"><h3>${section.category_name}</h3></div>
                    <div class="product-scroll-wrapper">
                        ${section.products.map(p => `
                            <div class="prod-card">
                                <div class="prod-img-box"><img src="${p.image}"></div>
                                <div class="prod-title">${p.name}</div>
                                <div class="prod-footer">
                                    <span class="prod-price">₹${parseInt(p.price)}</span>
                                    <button onclick="addToCart('${p.id}', 1, this)">ADD</button>
                                </div>
                            </div>`).join('')}
                    </div>
                </section>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    } catch (error) {
        if(loader) loader.innerHTML = '<p class="text-center text-muted">That is all for now!</p>';
    } finally {
        isFeedLoading = false;
    }
}

window.addToCart = async function(skuId, qty, btn) {
    if (!localStorage.getItem('access_token')) {
        window.location.href = '/auth.html';
        return;
    }
    const origText = btn.innerText;
    btn.innerText = '...';
    try {
        await apiCall('/orders/cart/add/', 'POST', { sku_id: skuId, quantity: qty });
        if(window.updateGlobalCartCount) window.updateGlobalCartCount();
        btn.innerText = '✔';
        setTimeout(() => btn.innerText = origText, 1500);
    } catch (e) {
        alert(e.message || "Failed to add");
        btn.innerText = origText;
    }
}