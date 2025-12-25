/* assets/js/utils/location_picker.js */
const LocationPicker = {
    state: { lat: 12.9716, lng: 77.5946, address: '', pincode: '' },
    map: null,
    onLocationSelect: null, // Callback function store karne ke liye

    init: function() {
        this.cacheDOM();
        this.bindEvents();
        // Sirf tab check karo agar hum address pick nahi kar rahe
        if(!this.onLocationSelect) this.checkInitialLocation();
    },

    cacheDOM: function() {
        this.elements = {
            modal: document.getElementById('location-modal'),
            closeBtn: document.getElementById('close-loc-modal'),
            gpsBtn: document.getElementById('btn-trigger-gps'),
            confirmBtn: document.getElementById('btn-confirm-location'),
            addressTitle: document.getElementById('loc-address-title'),
            addressText: document.getElementById('loc-address-text'),
            errorMsg: document.getElementById('service-error')
        };
    },

    bindEvents: function() {
        if(this.elements.closeBtn) this.elements.closeBtn.addEventListener('click', () => this.close());
        if(this.elements.gpsBtn) this.elements.gpsBtn.addEventListener('click', () => this.triggerGPS());
        if(this.elements.confirmBtn) this.elements.confirmBtn.addEventListener('click', () => this.confirmSelection());
    },

    // Is function ko call karke hum Address Form ke liye location mangwayenge
    pickForAddress: function(callback) {
        this.onLocationSelect = callback; // Callback set karo
        this.open();
        this.elements.confirmBtn.innerText = "Proceed to Add Details";
    },

    checkInitialLocation: function() {
        const savedLat = localStorage.getItem('user_lat');
        if (!savedLat) this.open();
    },

    open: function() {
        this.elements.modal.classList.add('active');
        document.body.classList.add('location-mode-active');
        setTimeout(() => {
            if (!this.map) this.initMap();
            else this.map.invalidateSize();
        }, 100);
    },

    close: function() {
        this.elements.modal.classList.remove('active');
        document.body.classList.remove('location-mode-active');
        // Reset callback logic after close
        setTimeout(() => { this.onLocationSelect = null; }, 500);
    },

    initMap: function() {
        this.map = L.map('picker-map', { zoomControl: false, center: [this.state.lat, this.state.lng], zoom: 15 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(this.map);
        
        this.map.on('move', () => {
            this.elements.confirmBtn.disabled = true;
            this.elements.confirmBtn.innerText = "Locating...";
        });

        this.map.on('moveend', async () => {
            const center = this.map.getCenter();
            this.state.lat = center.lat;
            this.state.lng = center.lng;
            await this.fetchAddress(center.lat, center.lng);
        });
        this.fetchAddress(this.state.lat, this.state.lng);
    },

    triggerGPS: function() {
        if (!navigator.geolocation) return alert("Geolocation disabled");
        navigator.geolocation.getCurrentPosition(
            (pos) => this.map.flyTo([pos.coords.latitude, pos.coords.longitude], 17),
            () => alert("Permission denied")
        );
    },

    fetchAddress: async function(lat, lng) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const addr = data.address;
            
            this.state.address = `${data.name || ''}, ${addr.suburb || addr.neighbourhood || ''}, ${addr.city || ''}`;
            this.state.pincode = addr.postcode || '';
            this.state.full_raw = data.address; // Save raw for form filling

            this.elements.addressTitle.innerText = addr.suburb || addr.city || "Selected Location";
            this.elements.addressText.innerText = this.state.address;
            this.elements.confirmBtn.disabled = false;
            this.elements.confirmBtn.innerText = this.onLocationSelect ? "Proceed to Add Details" : "Confirm Location";
        } catch (e) {
            this.elements.confirmBtn.disabled = false;
        }
    },

    confirmSelection: function() {
        // Agar koi Page (Profile/Checkout) location maang raha hai:
        if (this.onLocationSelect) {
            this.onLocationSelect({
                lat: this.state.lat,
                lng: this.state.lng,
                address_text: this.state.address,
                pincode: this.state.pincode,
                details: this.state.full_raw
            });
            this.close();
        } else {
            // Normal Home Page logic
            localStorage.setItem('user_lat', this.state.lat);
            localStorage.setItem('user_lng', this.state.lng);
            localStorage.setItem('user_address_text', this.state.address);
            localStorage.setItem('user_pincode', this.state.pincode);
            this.close();
            if(window.location.pathname.includes('not_serviceable')) window.location.href = '/index.html';
            else window.location.reload();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => LocationPicker.init());