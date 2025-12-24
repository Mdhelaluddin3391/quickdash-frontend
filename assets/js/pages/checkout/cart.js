document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    await loadCart();
});

async function loadCart() {
    const loader = document.getElementById('cart-loader');
    const content = document.getElementById('cart-content');
    const emptyState = document.getElementById('empty-cart');

    try {
        const cart = await apiCall('/orders/cart/');
        if (loader) loader.style.display = 'none';

        if (!cart.items || cart.items.length === 0) {
            emptyState.style.display = 'block';
            if(window.updateGlobalCartCount) window.updateGlobalCartCount();
            return;
        }

        content.style.display = 'flex';
        document.getElementById('cart-items-list').innerHTML = cart.items.map(item => `
            <div class="cart-item-card">
                <img src="${item.sku_image || 'https://via.placeholder.com/70'}" class="c-img">
                <div class="c-info">
                    <div class="c-name">${item.sku_name}</div>
                    <div class="c-price">₹${item.total_price}</div>
                </div>
                <div class="c-qty">
                    <button onclick="updateQty('${item.sku_id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQty('${item.sku_id}', ${item.quantity + 1})">+</button>
                </div>
            </div>`).join('');

        document.getElementById('subtotal').innerText = `₹${parseFloat(cart.total_amount).toFixed(2)}`;
        document.getElementById('final-total').innerText = `₹${(parseFloat(cart.total_amount) + 20).toFixed(2)}`; // Assuming flat fee 20
        
    } catch (e) { console.error(e); }
}

async function updateQty(skuId, newQty) {
    if (newQty < 0) return;
    try {
        await apiCall('/orders/cart/add/', 'POST', { sku_id: skuId, quantity: newQty });
        await loadCart();
        if(window.updateGlobalCartCount) window.updateGlobalCartCount();
    } catch (e) { alert(e.message); }
}
window.updateQty = updateQty;