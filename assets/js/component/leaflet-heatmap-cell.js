class LeafletHeatmapCell extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }
}

window.customElements.define('leaflet-heatmap-cell', LeafletMarker);