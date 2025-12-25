let selectedAddressId = null;
let selectedPayment = 'COD';

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    await loadAddresses();
    await loadSummary();
    
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});

// ... existing loadAddresses ...

// Add New Address Button Click Handler
document.getElementById('add-address-btn').addEventListener('click', () => {
    LocationPicker.pickForAddress((data) => {
        document.getElementById('address-modal').style.display = 'flex';
        
        // Auto Fill
        document.getElementById('c-lat').value = data.lat;
        document.getElementById('c-lng').value = data.lng;
        document.getElementById('c-pincode').value = data.pincode;
        document.getElementById('c-line').value = data.address_text;
        
        document.getElementById('c-house').focus();
    });
});

// Submit Handler
document.getElementById('new-address-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        full_address: `${document.getElementById('c-house').value}, ${document.getElementById('c-line').value}`,
        city: "Bengaluru", // Backend can auto-detect from lat/lng too
        pincode: document.getElementById('c-pincode').value,
        lat: document.getElementById('c-lat').value,
        lng: document.getElementById('c-lng').value,
        address_type: document.getElementById('c-type').value
    };

    try {
        await apiCall('/auth/customer/addresses/', 'POST', payload);
        document.getElementById('address-modal').style.display = 'none';
        await loadAddresses(); // Refresh list to show new address
        showToast("Address Added", "success");
    } catch(e) { alert(e.message); }
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



/* assets/js/pages/checkout/checkout.js */

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
        if(addresses.length > 0 && !selectedAddressId) selectedAddressId = addresses[0].id;

        container.innerHTML = addresses.map((a) => `
            <div class="addr-card ${selectedAddressId === a.id ? 'selected' : ''}" onclick="selectAddr('${a.id}', this)">
                <strong>${a.address_type}</strong>
                <p>${a.full_address}, ${a.city} - ${a.pincode}</p>
            </div>`).join('');
            
        // Add "Add Address" button at the end
        if(addresses.length === 0) container.innerHTML = '<p>No address found. Please add one.</p>';
    } catch(e) {}
}

async function loadSummary() {
    try {
        const cart = await apiCall('/orders/cart/');
        if(!cart.items || cart.items.length === 0) {
            window.location.href = '/cart.html';
            return;
        }
        document.getElementById('checkout-items-preview').innerHTML = cart.items.map(i => `
            <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:5px;">
                <span>${i.quantity} x ${i.sku_name}</span>
                <span>₹${i.total_price}</span>
            </div>
        `).join('');
        
        // Delivery Fee logic (Backend se aana chahiye, abhi hardcode +20 visual ke liye)
        const total = parseFloat(cart.total_amount) + 20; 
        document.getElementById('checkout-total').innerText = `₹${total.toFixed(2)}`;
    } catch(e) {}
}

window.selectAddr = function(id, el) {
    selectedAddressId = id;
    document.querySelectorAll('.addr-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
};

window.selectPayment = function(method) {
    selectedPayment = method;
    // UI Update
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    const input = document.querySelector(`input[value="${method}"]`);
    if(input) input.parentElement.classList.add('selected');
};

async function placeOrder() {
    if (!selectedAddressId) return alert("Please select a delivery address.");
    
    const btn = document.getElementById('place-order-btn');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
        // 1. Create Order on Backend
        const payload = { payment_method: selectedPayment, delivery_address_id: selectedAddressId };
        const response = await apiCall('/orders/create/', 'POST', payload);
        const order = response.order;

        if (selectedPayment === 'COD') {
            // Direct Success for COD
            window.location.href = `/success.html?order_id=${order.id}`;
        } else if (selectedPayment === 'RAZORPAY') {
            // 2. Open Razorpay Popup
            const options = {
                "key": "YOUR_RAZORPAY_KEY_ID", // Yahan apni Test Key daalna
                "amount": response.razorpay_order.amount,
                "currency": "INR",
                "name": "QuickDash",
                "description": "Order Payment",
                "order_id": response.razorpay_order.id, // RZP Order ID from Backend
                "handler": async function (response) {
                    // 3. Verify Payment on Backend
                    try {
                        btn.innerText = "Verifying...";
                        await apiCall('/orders/payment/verify/', 'POST', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        window.location.href = `/success.html?order_id=${order.id}`;
                    } catch (e) {
                        alert("Payment Verification Failed: " + e.message);
                        btn.disabled = false;
                        btn.innerText = originalText;
                    }
                },
                "prefill": {
                    "contact": localStorage.getItem('user_phone') || "",
                    "email": "customer@quickdash.com"
                },
                "theme": { "color": "#32CD32" }
            };
            
            const rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
                alert("Payment Failed: " + response.error.description);
                btn.disabled = false;
                btn.innerText = originalText;
            });
            rzp1.open();
        }
        
    } catch (e) {
        alert(e.message || "Order Failed");
        btn.disabled = false;
        btn.innerText = originalText;
    }
}