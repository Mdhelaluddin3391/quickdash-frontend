const LocationPicker = {
    state: { lat: null, lng: null, mode: 'MANUAL', address: '', isServiceable: false },
    elements: {}, map: null,

    init: function() {
        this.cacheDOM();
        this.bindEvents();
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

    open: function() {
        this.elements.modal.classList.remove('hidden');
        if (!this.map) {
            this.initMap();
        }
    },

    close: function() {
        this.elements.modal.classList.add('hidden');
    },

    initMap: function() {
        this.map = L.map('picker-map', { zoomControl: false }).setView([12.9716, 77.5946], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(this.map);

        this.map.on('move', () => {
            this.elements.confirmBtn.disabled = true;
            this.elements.addressTitle.innerText = "Locating...";
        });

        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            // In a real app, you would debounce a call to reverse geocode here
            this.state.lat = center.lat;
            this.state.lng = center.lng;
            
            this.elements.addressTitle.innerText = "Selected Location";
            this.elements.addressText.innerText = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
            this.elements.confirmBtn.disabled = false;
        });
    },

    triggerGPS: function() {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.map.flyTo([pos.coords.latitude, pos.coords.longitude], 17);
            },
            () => alert("Location access denied")
        );
    },

    confirmSelection: function() {
        localStorage.setItem('user_address_text', this.elements.addressText.innerText);
        // You could also save lat/lng to localStorage here
        this.close();
        window.location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => LocationPicker.init());