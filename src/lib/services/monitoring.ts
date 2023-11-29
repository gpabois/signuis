import { Point } from "geojson";
import { tile } from "../utils/slippyMap";
import { DeltaNuisanceTile, FilterNuisanceTile, Intensity, NuisanceTile, Report } from "../model";
import { INuisanceTileRepository } from "../repositories";
import { Signals } from "../signals";
import { Cursor } from "../utils/cursor";

import {createCanvas, loadImage, Canvas} from 'canvas';
import chroma from "chroma-js";

export interface NuisanceMapSettings {
    /**
     * Time period in miliseconds for sampling.
     * @default 60_000
     */
    timePeriod: number

    /**
     * Floor zoom of the nuisance slippy map.
     * @default 18
     */
    floorZoom: number
}

export interface IMonitoringService {
    /**
     * Retrieve nuisance tiles
     * @param filter 
     * @param cursor 
     */
    
    findNuisanceTilesBy(filter: FilterNuisanceTile, cursor?: Cursor): Promise<Array<NuisanceTile>>;
    /**
     * Count the number of nuisance tiles matching the filter
     * @param filter 
     */
    countNuisanceTilesBy(filter: FilterNuisanceTile): Promise<number>;

    /**
     * Generate a nuisance tile's rasterized image
     * @param index 
     * @param args 
     */
    getNuisanceTileImage(args: {x: number, y: number, z: number, between: {from: Date, to: Date}, nuisanceTypeIds: Array<string>}, options: {resolution?: number, floorZoom?: number, mimeType?: string}): Promise<Canvas>;
}

export interface MonitoringArgs {
    nuisanceMapSettings?: NuisanceMapSettings,
    nuisanceTiles: INuisanceTileRepository,
    signals: Signals
}   

/**
 * Everything related to the monitoring of nuisances.
 */
export class MonitoringService implements IMonitoringService {
    private nuisanceTiles: INuisanceTileRepository;
    private nuisanceMapSettings: NuisanceMapSettings;
    private signals: Signals

    constructor({nuisanceMapSettings, nuisanceTiles, signals}: MonitoringArgs) {
        this.nuisanceMapSettings = nuisanceMapSettings || {
            timePeriod: 60_000,
            floorZoom: 18,
        };
        this.nuisanceTiles = nuisanceTiles;
        this.signals = signals

        // Connect to some signals
        this.signals.report_created.connect((_, report) => this.onNewReport(report));
        this.signals.report_deleted.connect((_, report) => this.onDeletedReport(report));
    }

    /**
     * Generate the heatmap layer
     * @returns 
     */
    private getHeatmapColor() {
        return chroma.scale(['yellow', 'navy']).mode('lch').domain([1, 10])
    }

    /**
     * Recursively increment tiles from floor to the ceiling (z = 0)
     * @param delta 
     * @returns 
     */
    async incrementNuisanceTile(delta: DeltaNuisanceTile) {
        if(delta.z < 0) return;
        await this.nuisanceTiles.increment(delta);
        await this.incrementNuisanceTile({...tile.zoomOut(delta), isFloor: false})
    }

    /**
     * Recursively increment tiles from floor to the ceiling (z = 0)
     * @param delta 
     * @returns 
     */
    async decrementNuisanceTile(delta: DeltaNuisanceTile) {
        if(delta.z < 0) return;
        await this.nuisanceTiles.decrement(delta);
        await this.decrementNuisanceTile({...tile.zoomOut(delta), isFloor: false})
    }

    /**
     * Increment the weight of the corresponding nuisance tile, according to the report data.
     * @param report 
     * @returns 
     */
    async onNewReport(report: Report): Promise<void> {
        const delta = NuisanceTile.fromReport(
            report, 
            {
                timeSamplingInMs: this.nuisanceMapSettings.timePeriod,
                floorZoom: this.nuisanceMapSettings.floorZoom
            }
        );
        await this.incrementNuisanceTile({...delta, isFloor: true});
    }

    /**
     * Decrement the weight of the corresponding nuisance tile, according to the report data.
     * @param report 
     * @returns 
     */
    async onDeletedReport(report: Report): Promise<void> {
        let deltaNuisanceTile = NuisanceTile.fromReport(
            report, {
                timeSamplingInMs: this.nuisanceMapSettings.timePeriod,
                floorZoom: this.nuisanceMapSettings.floorZoom
        });
        await this.nuisanceTiles.decrement(deltaNuisanceTile);   
    }

    async findNuisanceTilesBy(filter: FilterNuisanceTile, cursor?: Cursor): Promise<Array<NuisanceTile>> {
        return this.nuisanceTiles.findBy(filter, cursor || {page: 0, size: 20})
    }
    
    async countNuisanceTilesBy(filter: FilterNuisanceTile): Promise<number> {
        return this.nuisanceTiles.countBy(filter)
    }

    async getNuisanceTileImage(
        {x, y, z, between, nuisanceTypeIds}: {x: number, y: number, z: number, between: {from: Date, to: Date}, nuisanceTypeIds: Array<string>}, 
        options?: {
            canvas?: Canvas, 
            box?: {x: number, y: number, h: number, w: number}
            resolution?: number, 
            floorZoom?: number, 
            mimeType?: string
        }
    ): Promise<Canvas> {
        const heatMapColor = this.getHeatmapColor();
        const canvas = options?.canvas || createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        const box = options?.box || {x: 0, y: 0, h: 256, w: 256}
        
        // Compute tile resolution, by default it is 4, which generates 256 pixels of nuisance which is 16x16 resolution.
        let floorZoom = 0;
        
        if(options?.floorZoom) {
            floorZoom = Number(options.floorZoom);
        } else {
            const resolution = options?.resolution || 4;
            floorZoom = Number(z) + resolution;
        }

        floorZoom = Math.min(floorZoom, this.nuisanceMapSettings.floorZoom);

        const [nuisanceTile] = await this.findNuisanceTilesBy({x, y, z, between, nuisanceTypeIds});

        // Premature stop
        if(nuisanceTile === undefined || nuisanceTile.count == 0)
            return canvas;

        // Generate leaf tile
        if(z >= floorZoom) {
            // Adjust to retrieve the floor tile for zoom greater then the floorZoom
            const n = Math.pow(2, z - floorZoom)
            x = Math.floor(x / n);
            y = Math.floor(y / n);

            if(nuisanceTile === undefined) {
                return canvas
            } else {
                const value = Intensity.wilsonScoreLowerBound(nuisanceTile.weights);
                
                if(value === 0) return canvas

                //@ts-ignore
                ctx.fillStyle = heatMapColor(value).alpha(0.8).hex();
                ctx.fillRect(box.x, box.y, box.w, box.h);
                
                return canvas
            }
        } 

        // Generate the tiles images, turn buffers into images, and draw them on the canvas
        let i = 0;

        const xs = [0, 1, 0, 1];
        const ys = [0, 0, 1, 1];

        await Promise.all(tile.children({x, y, z, between, nuisanceTypeIds}).map(async (coords) => {
            const dw = box.w / 2;
            const dh = box.h / 2;
            const dx = box.x + xs[i] * dw;
            const dy = box.y + ys[i] * dh;
            i++;
            await this.getNuisanceTileImage(coords, {
                canvas, 
                box: {x: dx, y: dy, w: dw, h: dh},
                floorZoom
            });
        }));
        
        return canvas
    }
}