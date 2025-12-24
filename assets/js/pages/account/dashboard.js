/* assets/js/pages/account/dashboard.js */
document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('user')) return window.location.href = '/auth.html';
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('nav-name').innerText = user.phone;
    document.getElementById('nav-phone').innerText = user.email || 'No email set';

    try {
        // Correct endpoint from orders/urls.py
        const response = await apiCall('/orders/my/', 'GET');
        const orders = response.results || response;
        
        // 1. Update Stats
        document.getElementById('total-orders-count').innerText = orders.length;
        const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        document.getElementById('total-spent').innerText = Formatters.toCurrency(totalSpent);

        // 2. Render Recent Orders
        const recentContainer = document.getElementById('recent-orders-container');
        if (orders.length === 0) {
            document.getElementById('empty-orders-state').style.display = 'block';
            recentContainer.innerHTML = '';
        } else {
            recentContainer.innerHTML = orders.slice(0, 3).map(o => `
                <div class="stat-card" style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>Order #${o.id}</strong>
                        <p style="font-size:0.8rem; color:#666;">${Formatters.toDate(o.created_at)}</p>
                    </div>
                    <div class="text-right">
                        <span class="badge" style="display:block; margin-bottom:5px;">${o.status.toUpperCase()}</span>
                        <a href="/order_detail.html?id=${o.id}" class="text-primary" style="font-size:0.8rem;">Details</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { 
        showToast("Failed to load dashboard data", "error");
    }
});