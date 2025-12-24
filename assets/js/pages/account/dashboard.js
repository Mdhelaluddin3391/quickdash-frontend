document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) return window.location.href = '/auth.html';
    
    // Fill Sidebar Info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if(document.getElementById('nav-name')) document.getElementById('nav-name').innerText = user.first_name || 'User';
    if(document.getElementById('nav-phone')) document.getElementById('nav-phone').innerText = user.phone || '';

    try {
        const orders = await apiCall('/orders/');
        const orderList = orders.results || orders;
        
        // Stats
        document.getElementById('total-orders-count').innerText = orderList.length;
        const totalSpent = orderList.reduce((sum, o) => sum + parseFloat(o.final_amount), 0);
        document.getElementById('total-spent').innerText = `₹${totalSpent.toFixed(2)}`;

        // Recent Orders
        const recentContainer = document.getElementById('recent-orders-container');
        if (orderList.length === 0) {
            document.getElementById('empty-orders-state').style.display = 'block';
            recentContainer.innerHTML = '';
        } else {
            recentContainer.innerHTML = orderList.slice(0, 5).map(o => `
                <div class="stat-card" style="margin-bottom:10px; display:flex; justify-content:space-between;">
                    <div>
                        <strong>Order #${o.id.slice(0,8).toUpperCase()}</strong>
                        <p style="font-size:0.8rem; color:#666;">${new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span class="badge">${o.status}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { console.error(e); }
});

window.logout = function() {
    localStorage.clear();
    window.location.href = '/index.html';
}