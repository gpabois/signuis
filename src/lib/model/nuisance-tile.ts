import { NuisanceType, Report } from ".";
import { tile } from "@/lib/utils/slippyMap";
import { Tuple } from "../utils/tuple";

import { Intensity, IntensityWeights } from "./intensity";


export namespace NuisanceTile {
    export function fromReport(report: Report, options: {timeSamplingInMs: number, floorZoom: number}): DeltaNuisanceTile {
        const createdAt = report.createdAt.getTime();

        // Nearest sampled time
        const t = new Date(createdAt - (createdAt % options.timeSamplingInMs));

        // Get the tile coordinates
        const {x, y, z} = tile.fromPoint(report.location, options.floorZoom)

        return {
            x, y, z, t, 
            nuisanceTypeId: report.nuisanceType.id, 
            count: 1, 
            isFloor: false,
            weights: Intensity.intoWeights(report.intensity)
        }
    }
}


export interface NuisanceTileIndex{x: number, y: number, z: number, t: Date, nuisanceTypeId: string}
export interface NuisanceTileAttributes {
    x: number,
    y: number,
    z: number,
    t: Date,
    isFloor: boolean,
    nuisanceTypeId: string,
    count: number,
    weights: IntensityWeights
}

/**
 * Represents an addition/substraction of nuisance in a nuisance tile.
 */
export type DeltaNuisanceTile = NuisanceTileAttributes;

export interface NuisanceTile {
    x: number,
    y: number,
    z: number,
    t: Date,
    nuisanceType: NuisanceType,
    count: number,
    weights: IntensityWeights
}



export type NuisanceTileAggregationField = "Time"

export interface NuisanceTileSum {
    x: number,
    y: number,
    z: number,
    count: number,
    weights: IntensityWeights
}

export type FilterNuisanceTile = Partial<NuisanceTileAttributes> & {
    within?: {
        nw: {lat: number, lon: number},
        se: {lat: number, lon: number}
    }
    nuisanceTypeIds?: Array<string>,
    between?: {from: Date, to: Date},
    coordinates?: Array<{x: number, y: number, z: number, t: Date, nuisanceTypeId?: string}>
}


