window.initMap = async function() {
    const id = new URLSearchParams(window.location.search).get('id');
    if(!id) return;
    
    document.getElementById('order-id-display').innerText = `Order #${id.slice(0,8).toUpperCase()}`;

    try {
        const order = await apiCall(`/orders/${id}/`);
        // Simple logic to highlight step
        const steps = ['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'];
        const currentIdx = steps.indexOf(order.status.toUpperCase());
        
        ['step-confirmed', 'step-packed', 'step-dispatched', 'step-delivered'].forEach((id, idx) => {
            const el = document.getElementById(id);
            if(idx <= currentIdx) el.classList.add('active');
        });

        // Initialize Map
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: parseFloat(order.delivery_lat || 12.9716), lng: parseFloat(order.delivery_lng || 77.5946) },
            zoom: 14
        });
        new google.maps.Marker({ position: map.getCenter(), map: map, title: "Delivery Location" });

    } catch(e) { console.error(e); }
}


/* assets/js/pages/account/track_order.js */

let map, marker;
let trackingInterval;

window.initMap = async function() {
    const id = new URLSearchParams(window.location.search).get('id');
    if(!id) return window.location.href = '/orders.html';
    
    document.getElementById('order-id-display').innerText = `Order #${id.slice(0,8).toUpperCase()}`;

    // Initialize Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default
        zoom: 14,
        disableDefaultUI: true
    });
    marker = new google.maps.Marker({ position: map.getCenter(), map: map });

    // First Fetch
    await fetchOrderStatus(id);

    // Live Polling (Every 5 seconds)
    trackingInterval = setInterval(() => fetchOrderStatus(id), 5000);
}

async function fetchOrderStatus(orderId) {
    try {
        const order = await apiCall(`/orders/${orderId}/`);
        
        // Update UI Steps
        updateTimeline(order.status);

        // Update Details
        document.getElementById('order-total').innerText = `₹${order.final_amount}`;
        document.getElementById('order-payment').innerText = order.payment_method;
        if(order.delivery_address_json) {
            document.getElementById('order-address-text').innerText = order.delivery_address_json.full_address;
        }

        // Handle Rider Info (Simulated)
        if(['DISPATCHED', 'ON_WAY'].includes(order.status)) {
            document.getElementById('rider-info').innerHTML = `
                <b>Rider:</b> Rahul Kumar <br>
                <i class="fas fa-phone"></i> +91 9876543210
            `;
        }

        // Map Update (Agar Rider ki location backend de raha hai)
        // Backend should send 'rider_lat', 'rider_lng' ideally
        // Abhi hum Delivery Location par focus rakhenge
        if (order.delivery_lat && order.delivery_lng) {
            const loc = { lat: parseFloat(order.delivery_lat), lng: parseFloat(order.delivery_lng) };
            marker.setPosition(loc);
            map.panTo(loc);
        }

        // Stop polling if delivered or cancelled
        if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
            clearInterval(trackingInterval);
        }

    } catch(e) { console.error("Tracking Error:", e); }
}

function updateTimeline(status) {
    const steps = ['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'];
    // Backend status mapping
    let currentStepIndex = -1;
    
    if (status === 'Pending') currentStepIndex = -1;
    else if (status === 'Confirmed') currentStepIndex = 0;
    else if (status === 'Shipped' || status === 'Dispatched') currentStepIndex = 2; // Skipping packed logic for simplicity
    else if (status === 'Delivered') currentStepIndex = 3;

    // Reset all
    document.querySelectorAll('.status-step').forEach(el => el.classList.remove('active'));

    // Activate specific steps
    const stepIds = ['step-confirmed', 'step-packed', 'step-dispatched', 'step-delivered'];
    
    stepIds.forEach((id, idx) => {
        if (idx <= currentStepIndex) {
            document.getElementById(id).classList.add('active');
        }
    });
}