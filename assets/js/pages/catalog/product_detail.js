document.addEventListener('DOMContentLoaded', async () => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return window.location.href = '/index.html';

    try {
        const product = await apiCall(`/catalog/skus/${code}/`);
        
        document.getElementById('p-name').innerText = product.name;
        document.getElementById('p-brand').innerText = product.brand_name || 'QuickDash';
        document.getElementById('p-unit').innerText = product.unit;
        document.getElementById('p-price').innerText = `₹${parseFloat(product.sale_price).toFixed(0)}`;
        document.getElementById('p-desc').innerText = product.description || "No description available.";
        document.getElementById('p-image').src = product.image_url || 'https://via.placeholder.com/300';

        const addBtn = document.getElementById('add-to-cart-btn');
        addBtn.onclick = () => addToCart(product.id, addBtn);

    } catch (e) {
        document.getElementById('product-content').innerHTML = '<p class="text-center p-5">Product not found.</p>';
    }
});

async function addToCart(skuId, btn) {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    btn.innerText = "Adding...";
    try {
        await apiCall('/orders/cart/add/', 'POST', { sku_id: skuId, quantity: 1 });
        btn.innerText = "ADDED ✔";
        if(window.updateGlobalCartCount) window.updateGlobalCartCount();
        setTimeout(() => btn.innerText = "ADD TO CART", 2000);
    } catch (e) {
        alert(e.message);
        btn.innerText = "ADD TO CART";
    }
}