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
            shadowUrl: '/images/marker-shadow.png',
            iconSize: [64, 64],
        });
    }

    reloadMarkers() {
        const markerElements = this.querySelectorAll('leaflet-marker')
        markerElements.forEach(markerEl => {
            const lat = markerEl.getAttribute('lat')
            const lng = markerEl.getAttribute('lng')

            const leafletMarker = L.marker([lat, lng]).addTo(this.map);
            
            leafletMarker.addEventListener('click', (_event) => {
                markerEl.click()
            })

            const iconEl = markerEl.querySelector('leaflet-icon');
            const iconSize = [iconEl.getAttribute('width'), iconEl.getAttribute('height')]

            iconEl.addEventListener('url-updated', (e) => {
                leafletMarker.setIcon(L.icon({
                    iconUrl: e.detail,
                    iconSize: iconSize,
                    iconAnchor: iconSize
                }))
            })
        })
    }

    connectedCallback() {
        this.reloadMarkers();
    }
}

window.customElements.define('leaflet-map', LeafletMap);