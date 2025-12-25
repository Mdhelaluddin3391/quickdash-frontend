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


// ... existing loadAddresses code ...

// Open Map First!
window.openAddressModal = function() {
    // LocationPicker ko bolo ki jab user select kare, toh ye function chalao
    LocationPicker.pickForAddress((data) => {
        // Map close hone ke baad ye chalega
        document.getElementById('addr-modal').style.display = 'flex';
        
        // Form Fill karo Map data se
        document.getElementById('a-lat').value = data.lat;
        document.getElementById('a-lng').value = data.lng;
        document.getElementById('a-pincode').value = data.pincode;
        document.getElementById('a-city').value = data.details.city || data.details.state_district || '';
        document.getElementById('a-line').value = data.address_text; // Street line from map
        
        // Focus on House No for manual entry
        setTimeout(() => document.getElementById('a-house').focus(), 500);
    });
}

// Add Address Submit Handler
document.getElementById('add-addr-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        full_address: `${document.getElementById('a-house').value}, ${document.getElementById('a-line').value}`,
        city: document.getElementById('a-city').value,
        pincode: document.getElementById('a-pincode').value,
        lat: document.getElementById('a-lat').value,
        lng: document.getElementById('a-lng').value,
        address_type: document.querySelector('input[name="address_type"]:checked').value
    };


// ... existing loadAddresses code ...

// Open Map First!
window.openAddressModal = function() {
    // LocationPicker ko bolo ki jab user select kare, toh ye function chalao
    LocationPicker.pickForAddress((data) => {
        // Map close hone ke baad ye chalega
        document.getElementById('addr-modal').style.display = 'flex';
        
        // Form Fill karo Map data se
        document.getElementById('a-lat').value = data.lat;
        document.getElementById('a-lng').value = data.lng;
        document.getElementById('a-pincode').value = data.pincode;
        document.getElementById('a-city').value = data.details.city || data.details.state_district || '';
        document.getElementById('a-line').value = data.address_text; // Street line from map
        
        // Focus on House No for manual entry
        setTimeout(() => document.getElementById('a-house').focus(), 500);
    });
}

// Add Address Submit Handler
document.getElementById('add-addr-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        full_address: `${document.getElementById('a-house').value}, ${document.getElementById('a-line').value}`,
        city: document.getElementById('a-city').value,
        pincode: document.getElementById('a-pincode').value,
        lat: document.getElementById('a-lat').value,
        lng: document.getElementById('a-lng').value,
        address_type: document.querySelector('input[name="address_type"]:checked').value
    };

    try {
        await apiCall('/auth/customer/addresses/', 'POST', payload);
        document.getElementById('addr-modal').style.display = 'none';
        loadAddresses(); // Refresh list
        showToast("Address Saved!", "success");
    } catch(e) { showToast(e.message, "error"); }
});

    try {
        await apiCall('/auth/customer/addresses/', 'POST', payload);
        document.getElementById('addr-modal').style.display = 'none';
        loadAddresses(); // Refresh list
        showToast("Address Saved!", "success");
    } catch(e) { showToast(e.message, "error"); }
});
window.deleteAddr = async function(id) {
    if(!confirm("Delete?")) return;
    try {
        await apiCall(`/auth/customer/addresses/${id}/`, 'DELETE');
        loadAddresses();
    } catch(e) { alert(e.message); }
}