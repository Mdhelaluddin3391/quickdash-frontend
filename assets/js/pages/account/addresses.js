document.addEventListener('DOMContentLoaded', loadAddresses);

async function loadAddresses() {
    const grid = document.getElementById('address-grid');
    try {
        const response = await apiCall('/auth/customer/addresses/');
        const addresses = response.results || response;
        
        if (addresses.length === 0) {
            grid.innerHTML = '<p>No addresses saved.</p>';
            return;
        }

        grid.innerHTML = addresses.map(a => `
            <div class="addr-item" style="background:#fff; padding:15px; border:1px solid #eee; margin-bottom:10px; border-radius:8px;">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${a.address_type}</strong>
                    ${a.is_default ? '<span style="color:green;">Default</span>' : ''}
                </div>
                <p>${a.full_address}</p>
                <button onclick="deleteAddr('${a.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
            </div>
        `).join('');
    } catch(e) {}
}

window.openAddressModal = function() {
    document.getElementById('addr-modal').style.display = 'flex';
}

window.deleteAddr = async function(id) {
    if(!confirm("Delete?")) return;
    try {
        await apiCall(`/auth/customer/addresses/${id}/`, 'DELETE');
        loadAddresses();
    } catch(e) { alert(e.message); }
}