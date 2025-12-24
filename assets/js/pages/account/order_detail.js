document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = '/orders.html';

    try {
        const order = await apiCall(`/orders/${id}/`);
        document.getElementById('od-loader').style.display = 'none';
        document.getElementById('od-container').style.display = 'block';

        document.getElementById('disp-id').innerText = `Order #${order.id.slice(0,8).toUpperCase()}`;
        document.getElementById('disp-date').innerText = new Date(order.created_at).toLocaleString();
        document.getElementById('disp-status').innerText = order.status;

        document.getElementById('items-list').innerHTML = order.items.map(i => `
            <div class="item-row">
                <img src="${i.sku_image}" class="item-img">
                <div style="flex:1;">
                    <h4>${i.sku_name_snapshot}</h4>
                    <small>Qty: ${i.quantity}</small>
                </div>
                <div class="item-price">₹${i.total_price}</div>
            </div>
        `).join('');

        document.getElementById('val-total').innerText = `₹${order.final_amount}`;
        if(order.delivery_address_json) {
            document.getElementById('disp-addr').innerText = order.delivery_address_json.full_address || 'Address info missing';
        }
        document.getElementById('btn-track').href = `/track_order.html?id=${order.id}`;

    } catch (e) {
        document.getElementById('od-loader').innerHTML = '<p>Order not found.</p>';
    }
});