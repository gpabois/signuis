import { NuisanceType } from ".";
import { TileIndex } from "../utils/slippyMap";

export interface NuisanceTileIndex{x: number, y: number, z: number, t: number, nuisanceTypeId: string}

export interface NuisanceTileAttributes {
    x: number,
    y: number,
    z: number,
    t: number,
    nuisanceTypeId: string,
    count: number,
    weight: number
}

export type DeltaNuisanceTile = NuisanceTileAttributes;

export interface NuisanceTile {
    x: number,
    y: number,
    z: number,
    t: number,
    nuisanceType: NuisanceType,
    count: number,
    weight: number
}

export type FilterNuisanceTile = Partial<NuisanceTileAttributes>;


