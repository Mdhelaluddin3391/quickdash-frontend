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