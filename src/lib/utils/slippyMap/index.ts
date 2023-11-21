import { Point } from "geojson"

/**
 * A tile from a slippy map
 */
export interface TileIndex {
    x: number,
    y: number,
    z: number
}

export namespace tile {
    /**
     * Zoom in 
     * @param tile
     */
    export function zoomIn<T extends TileIndex>(tile: T) {
        tile.x = 2*tile.x;
        tile.y = 2*tile.y;
        tile.z += 1;
    }

    /**
     * Zoom out
     * @param tile
     */
    export function zoomOut<T extends TileIndex>(tile: T) {
        tile.x = tile.x / 2;
        tile.y = tile.y / 2;
        tile.z -= 1;
    }

    /**
     * Fill the tile coordinates from a given point at a given zoom
     * @param tile 
     * @param point 
     * @param zoom 
     */
    export function fromPoint<T extends TileIndex>(tile: T, point: Point, zoom: number) {
        const lon = point.coordinates[0];
        const lat = point.coordinates[1];

        const n = Math.pow(2, zoom);
        tile.x = Math.floor(n * ((lon + 180.0) / 360.0));
        tile.y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 * n);
        tile.z = zoom;
    }
}


