import { NuisanceType, Report } from ".";
import { tile } from "@/lib/utils/slippyMap";
import { Tuple } from "../utils/tuple";
import { Point } from "geojson";

export namespace NuisanceTile {
    export function createRankWeights(): NuisanceTileRankWeights {
        return new Array(5).map((_) => 0) as NuisanceTileRankWeights
    }

    export function intoWeights(intensity: number): NuisanceTileRankWeights {
        let weights = createRankWeights();
        weights[intensity] = 1;
        return weights;

    }
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
            weights: intoWeights(report.intensity)
        }
    }
}

export interface NuisanceTileIndex{x: number, y: number, z: number, t: Date, nuisanceTypeId: string}

export type NuisanceTileRankWeights = Tuple<number, 5>;

export interface NuisanceTileAttributes {
    x: number,
    y: number,
    z: number,
    t: Date,
    isFloor: boolean,
    nuisanceTypeId: string,
    count: number,
    weights: NuisanceTileRankWeights
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
    weights: NuisanceTileRankWeights
}

export type FilterNuisanceTile = Partial<NuisanceTileAttributes> & {
    nearest_bounds?: {
        nw: {lat: number, lon: number},
        se: {lat: number, lon: number}
    }
    interval?: {start: Date, end: Date}
}

