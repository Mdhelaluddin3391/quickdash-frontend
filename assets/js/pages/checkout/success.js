document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (orderId) {
        document.getElementById('success-order-id').innerText = "#" + orderId.slice(0, 8).toUpperCase();
        const trackBtn = document.getElementById('track-btn');
        if (trackBtn) trackBtn.href = "/track_order.html?id=" + orderId;
    }
});