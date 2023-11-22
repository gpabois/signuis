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
     * Children indexes
     * @return [NW, NE, SW, SE]
     */
    export function children<T extends TileIndex>(tile: T): [T, T, T, T] {
        const sub = zoomIn({...tile});

        return [
            sub,
            right(sub),
            down(sub),
            down(right(sub))
        ]
    }   
    
    export function right<T extends TileIndex>(tile: T): T {
        return {...tile, x: tile.x + 1}
    }

    export function down<T extends TileIndex>(tile: T): T {
        return {...tile, y: tile.y + 1}
    }

    /**
     * Zoom in 
     * @param tile
     */
    export function zoomIn<T extends TileIndex>(tile: T): T {
        const x = 2*Number(tile.x);
        const y = 2*Number(tile.y);
        const z = Number(tile.z) + 1;
        return {...tile, x, y, z}
    }

    /**
     * Zoom out
     * @param tile
     */
    export function zoomOut<T extends TileIndex>(tile: T): T {
        const x = Math.floor(tile.x / 2);
        const y = Math.floor(tile.y / 2);
        const z = tile.z - 1;
        return {...tile, x, y, z}
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


