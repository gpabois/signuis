import { TileIndex } from "../utils/slippyMap";

export interface NuisanceTileIndex{x: number, y: number, z: number, t: number, nuisanceTypeId: string}

export interface NuisanceTile {
    x: number,
    y: number,
    z: number,
    t: number,
    nuisanceTypeId: string,
    count: number,
    weight: number
}


