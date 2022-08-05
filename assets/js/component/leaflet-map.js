import L from "../../vendor/leaflet/leaflet"

const template = document.createElement('template');
template.innerHTML = `
    <div style="height: 100%">
        <slot />
    </div>
`

class LeafletMap extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        
        for(var link of document.querySelectorAll("link")) {
            console.log(link);
            this.shadowRoot.appendChild(link.cloneNode(true));
        }

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.mapElement = this.shadowRoot.querySelector('div')

        this.map = L.map(this.mapElement, {
            zoomControl: false}).setView([this.getAttribute('lat'), this.getAttribute('lng')], 13);
        
        this.map.on('moveend', function () {
            var bounds = this.map.getBounds();
            var event = new CustomEvent('bounds-updated', {detail: {bounds: bounds}});
            this.dispatchEvent(event);
        }.bind(this));

        this.markers = [];

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
        this.markers.forEach((marker) => marker.remove());
        this.markers = [];

        const markerElements = this.querySelectorAll('leaflet-marker');
        
        markerElements.forEach(function(markerEl) {
            const lat = markerEl.getAttribute('lat')
            const lng = markerEl.getAttribute('lng')

            const data_id = markerEl.getAttribute('data-id')
            const data_type = markerEl.getAttribute('data-type')

            var icon = this.defaultIcon;

            if (markerEl.querySelectorAll('div').length > 0) {
                var divEl = markerEl.querySelectorAll('div')[0];

                icon = L.divIcon({
                    html: divEl.outerHTML,
                    iconSize: null
                });
            }

            const leafletMarker = L.marker([lat, lng], {icon: icon}).addTo(this.map);

            this.markers.push(leafletMarker);
            
            leafletMarker.addEventListener('click', function(event) {
                markerEl.click();
                var event = new CustomEvent('marker-clicked', {detail: {target: leafletMarker, data: {id: data_id, type: data_type}}});
                this.dispatchEvent(event)
            }.bind(this));
        }.bind(this))
    }

    connectedCallback() {
        this.reloadMarkers();
    }
}

window.customElements.define('leaflet-map', LeafletMap);