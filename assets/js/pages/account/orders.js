document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    
    const list = document.getElementById('orders-list');
    try {
        const response = await apiCall('/orders/');
        const orders = response.results || response;

        if (orders.length === 0) {
            document.getElementById('no-orders').style.display = 'block';
            list.style.display = 'none';
            return;
        }

        list.innerHTML = orders.map(o => `
            <div class="stat-card" style="margin-bottom:15px; display:block;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <h4>Order #${o.id.slice(0,8).toUpperCase()}</h4>
                    <span class="badge" style="background:#eee;padding:2px 8px;border-radius:4px;">${o.status}</span>
                </div>
                <p style="font-size:0.9rem; color:#666;">
                    ${new Date(o.created_at).toDateString()} • ₹${o.final_amount}
                </p>
                <div style="margin-top:10px;">
                    <a href="/track_order.html?id=${o.id}" style="color:var(--primary);font-weight:600;">Track Order</a>
                    <a href="/order_detail.html?id=${o.id}" style="margin-left:15px;color:#333;">View Details</a>
                </div>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<p>Error loading orders.</p>';
    }
});