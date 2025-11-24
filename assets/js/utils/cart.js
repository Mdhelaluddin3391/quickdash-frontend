// assets/js/cart.js

document.addEventListener('DOMContentLoaded', loadCart);

async function loadCart() {
    const listContainer = document.querySelector('.cart-items-list');
    const emptyMsg = document.querySelector('.empty-cart-message');
    const summaryContainer = document.querySelector('.order-summary-container');

    if (!isLoggedIn()) {
        window.location.href = 'auth.html';
        return;
    }

    try {
        const cart = await apiCall('/orders/cart/', 'GET', null, true);

        if (cart.items.length === 0) {
            emptyMsg.style.display = 'block';
            summaryContainer.style.display = 'none';
            // Purane items hatao (except headers/empty msg)
            const oldItems = document.querySelectorAll('.cart-item');
            oldItems.forEach(el => el.remove());
            return;
        }

        emptyMsg.style.display = 'none';
        summaryContainer.style.display = 'block';

        // Render Items
        // Pehle existing items clear karte hain taaki duplicate na ho
        const existingItems = document.querySelectorAll('.cart-item');
        existingItems.forEach(e => e.remove());

        // Header ke baad insert karne ke liye reference
        const header = document.querySelector('.cart-header');

        cart.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.sku_image || 'https://via.placeholder.com/100'}" class="item-image">
                <div class="item-details">
                    <h3 class="item-name">${item.sku_name}</h3>
                    <p class="item-price-per-unit">₹${item.price}</p>
                </div>
                <div class="item-controls">
                    <div class="item-quantity-control">
                        <button class="quantity-btn" onclick="updateQty('${item.sku_id}', ${item.quantity - 1})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQty('${item.sku_id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-total-price">₹${item.total_price}</div>
                </div>
            `;
            // Header ke baad insert karo
            header.insertAdjacentElement('afterend', div);
        });

        // Update Totals
        document.getElementById('summary-subtotal').innerText = `₹${cart.total_amount}`;
        // Delivery fee backend se aana chahiye, abhi hardcode ya logic laga sakte hain
        const deliveryFee = 20; 
        const total = parseFloat(cart.total_amount) + deliveryFee;
        document.getElementById('summary-total').innerText = `₹${total.toFixed(2)}`;

    } catch (e) {
        console.error(e);
    }
}

// Quantity Update / Remove
window.updateQty = async function(skuId, newQty) {
    try {
        // Agar qty 0 hai toh backend remove handle karega
        await apiCall('/orders/cart/add/', 'POST', {
            sku_id: skuId,
            quantity: newQty
        }, true);
        
        // Reload cart to reflect changes
        loadCart();
        updateGlobalCartCount();
    } catch (e) {
        alert("Error updating cart");
    }
};