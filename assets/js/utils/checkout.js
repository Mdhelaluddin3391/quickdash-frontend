// assets/js/checkout.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) window.location.href = 'auth.html';

    await loadAddresses();
    await loadCartSummary(); // Subtotal dikhane ke liye

    // Place Order Button
    const placeBtn = document.querySelector('.place-order-button');
    if(placeBtn) {
        placeBtn.addEventListener('click', handlePlaceOrder);
    }
});

async function loadAddresses() {
    const section = document.querySelector('.checkout-section'); // Address section
    // Existing static cards hata dein (first child h2 ko chhodkar)
    // Better: ek container div bana lein HTML mein addresses ke liye
    
    try {
        const addresses = await apiCall('/auth/customer/addresses/', 'GET', null, true);
        
        // HTML populate logic (simplified)
        // Yahan hum maante hain ki aapne HTML mein ek div id="address-list" banaya hai
        // Agar nahi, toh directly insert kar rahe hain
        
        // Note: Aapko ek "warehouse_id" bhi chahiye order create karne ke liye. 
        // Demo ke liye hum pehla warehouse fetch karke use karenge.
        window.warehouseId = await getWarehouseId();

    } catch (e) {
        console.error(e);
    }
}

// Helper to get a valid warehouse ID (Backend requirement)
async function getWarehouseId() {
    try {
        const whs = await apiCall('/wms/warehouses/', 'GET', null, true);
        if(whs && whs.length > 0) return whs[0].id;
        return null;
    } catch (e) {
        return null; // Backend might handle default
    }
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    
    if(!window.warehouseId) {
        alert("Service unavailable in this area (No warehouse found).");
        return;
    }

    // Dummy address data for now (Frontend form se uthana chahiye)
    const dummyAddress = {
        line1: "123 Street",
        city: "Demo City",
        pincode: "123456"
    };

    const payload = {
        warehouse_id: window.warehouseId,
        payment_method: "COD", // Radio button se value lein
        delivery_address_json: dummyAddress,
        // Lat/Lng optional hain
    };

    try {
        const resp = await apiCall('/orders/create/', 'POST', payload, true);
        
        if(resp.order || resp.order_id) {
            // Success!
            window.location.href = 'order_success.html';
        }
    } catch (error) {
        alert("Order Failed: " + error.message);
    }
}