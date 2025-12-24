let selectedAddressId = null;
let selectedPayment = 'COD';

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    await loadAddresses();
    await loadSummary();
    
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});

async function loadAddresses() {
    const container = document.getElementById('address-list');
    try {
        const response = await apiCall('/auth/customer/addresses/');
        const addresses = response.results || response;
        container.innerHTML = addresses.map((a, idx) => {
            if(idx === 0 && !selectedAddressId) selectedAddressId = a.id; // Auto select first
            return `
            <div class="addr-card ${selectedAddressId === a.id ? 'selected' : ''}" onclick="selectAddr('${a.id}', this)">
                <strong>${a.address_type}</strong>
                <p>${a.full_address}</p>
            </div>`;
        }).join('');
    } catch(e) {}
}

async function loadSummary() {
    try {
        const cart = await apiCall('/orders/cart/');
        document.getElementById('checkout-items-preview').innerHTML = cart.items.map(i => `
            <div style="display:flex;justify-content:space-between;font-size:0.9rem;">
                <span>${i.quantity} x ${i.sku_name}</span>
                <span>₹${i.total_price}</span>
            </div>
        `).join('');
        document.getElementById('checkout-total').innerText = `₹${(parseFloat(cart.total_amount) + 20).toFixed(2)}`;
    } catch(e) {}
}

window.selectAddr = function(id, el) {
    selectedAddressId = id;
    document.querySelectorAll('.addr-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
};

window.selectPayment = function(method) {
    selectedPayment = method;
};

async function placeOrder() {
    if (!selectedAddressId) return alert("Please select a delivery address.");
    
    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
        const payload = { payment_method: selectedPayment, delivery_address_id: selectedAddressId };
        const orderData = await apiCall('/orders/create/', 'POST', payload);
        
        // Simple success redirect for COD
        window.location.href = `/success.html?order_id=${orderData.order.id}`;
        
    } catch (e) {
        alert(e.message || "Order Failed");
        btn.disabled = false;
        btn.innerText = "Place Order";
    }
}