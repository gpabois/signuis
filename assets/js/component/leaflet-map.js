import L from "../../vendor/leaflet/leaflet"

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
    integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
    crossorigin=""/>
    <div style="height: 100%">
        <slot />
    </div>
`

class LeafletMap extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.mapElement = this.shadowRoot.querySelector('div')

        this.map = L.map(this.mapElement, {
            zoomControl: false}).setView([this.getAttribute('lat'), this.getAttribute('lng')], 13);
        
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        this.defaultIcon = L.icon({
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png'
        });
    }

    reloadMarkers() {
        const markerElements = this.querySelectorAll('leaflet-marker')
        markerElements.forEach(markerEl => {
            const lat = markerEl.getAttribute('lat')
            const lng = markerEl.getAttribute('lng')
            const data_id = markerEl.getAttribute('data-id')
            const data_type = markerEl.getAttribute('data-type')

            const leafletMarker = L.marker([lat, lng], {icon: this.defaultIcon}).addTo(this.map);
            
            leafletMarker.addEventListener('click', function(event) {
                markerEl.click();
                event = new CustomEvent('marker-clicked', {detail: {target: leafletMarker, data: {id: data_id, type: data_type}}});
                this.dispatchEvent(event)
            }.bind(this));
        })
    }

    connectedCallback() {
        this.reloadMarkers();
    }
}

window.customElements.define('leaflet-map', LeafletMap);