export default class ReportingLiveView { 
    view_mounted ({liveSocket}) {
        this.map_container = document.getElementById("map-container");
        this.map = document.getElementById("map").map;

        window.onresize = this.resizeMap;
        this.resizeMap();

        var view = this;
        
        liveSocket.hooks.ReportingLiveView = {
            updated () {
                mdc.autoInit(); // Should be called each time...
            },

            mounted() {
                view.hook = this;
                view.map.on('moveend', function () {
                    var bounds = view.map.getBounds();
                    this.pushEvent("map-bounds-update", bounds);
                }.bind(this));
            }
        };
    }

    enable_geolocation () {
        this.locWatchId = navigator.geolocation.watchPosition(function(loc) {
            this.hook.pushEvent('user-loc-update', {
                lat: loc.coords.latitude,
                long: loc.coords.longitude
            });
        }.bind(this));
    }

    disable_geolocation() {
        if(this.locWatchId) {
            navigator.geolocation.clearWatch(this.locWatchId);
        }
    }

    view_unmounted() {

    }

    resizeMap() {
        this.map_container = document.getElementById("map-container");
        this.map = document.getElementById("map").map;
        
        this.map_container.style.width = "100%"; //window.innerWidth + "px";
        this.map_container.style.height = window.innerHeight + "px";

        this.map.invalidateSize(true);
    }

    updated () {
        this.resizeMap();
    }

}
