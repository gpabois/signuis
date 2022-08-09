import L from "../../vendor/leaflet/leaflet"
import "../../vendor/leaflet-heatmap"

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
            this.shadowRoot.appendChild(link.cloneNode(true));
        }

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.mapElement = this.shadowRoot.querySelector('div')

        this.map = L.map(this.mapElement, {
            maxZoom: 16,
            zoomControl: false}).setView([this.getAttribute('lat'), this.getAttribute('lng')], this.getAttribute("zoom") ? this.getAttribute("zoom") : 16);
        
        this.map.on('moveend', function () {
            var bounds = this.map.getBounds();
            var event = new CustomEvent('bounds-updated', {detail: {bounds: bounds}});
            this.dispatchEvent(event);
        }.bind(this));

        this.markers = [];
        this.heatmapLayer = L.heatLayer([]);

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

    flyTo(location) {
        this.map.invalidateSize();
        this.map.flyTo([
            location["coordinates"]["lat"],
            location["coordinates"]["long"]
        ], 16)
    }

    reloadData() {
        this.markers.forEach((marker) => marker.remove());
        this.heatmapLayer.remove();

        this.markers = [];
        var heatmap_cell_radius = Math.max([...this.querySelectorAll('leaflet-heatmap-cell')].map(function(heatmapCell) {
            return heatmapCell.getAttribute('precision')
        }.bind(this)));

        var heatmap = [...this.querySelectorAll('leaflet-heatmap-cell')].map(function(heatmapCell) {
            return [
                heatmapCell.getAttribute('lat'),
                heatmapCell.getAttribute('lng'),
                heatmapCell.getAttribute('weight')
            ]
        }.bind(this));

        this.heatmapLayer = L.heatLayer(heatmap, {max: 50, opacity: 0.6, maxZoom: 16, radius: heatmap_cell_radius});
        this.heatmapLayer.addTo(this.map);

        this.querySelectorAll('leaflet-marker').forEach(function(markerEl) {
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
        this.reloadData();
    }
}

window.customElements.define('leaflet-map', LeafletMap);