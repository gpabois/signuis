import { Point } from "geojson";
import { tile } from "../utils/slippyMap";
import { DeltaNuisanceTile, FilterNuisanceTile, NuisanceTile, Report } from "../model";
import { INuisanceTileRepository } from "../repositories";
import { Signals } from "../signals";
import { Cursor } from "../utils/cursor";

import {createCanvas} from 'canvas';

export interface NuisanceMapSettings {
    /**
     * Time period in seconds for sampling.
     * @default 60
     */
    timePeriod: number

    /**
     * Floor zoom of the nuisance slippy map.
     * @default 1
     */
    floorZoom: number
}

export interface IMonitoringService {
    findNuisanceTilesBy(filter: FilterNuisanceTile, cursor?: Cursor): Promise<Array<NuisanceTile>>;
    countNuisanceTilesBy(filter: FilterNuisanceTile): Promise<number>;

    getNuisanceTileImage(index: {x: number, y: number, z: number, t: number}, args: {mimeType?: string}): Promise<Buffer>;
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
            timePeriod: 60,
            floorZoom: 13,
        };
        this.nuisanceTiles = nuisanceTiles;
        this.signals = signals

        // Connect to some signals
        this.signals.report_created.connect((_, report) => this.onNewReport(report));
        this.signals.report_deleted.connect((_, report) => this.onDeletedReport(report));
    }

    /**
     * Convert a report into a nuisance tile.
     * @param report
     * @returns 
     */
    private convertReportToNuisanceTile(report: Report): DeltaNuisanceTile {
        let nuisanceTile: DeltaNuisanceTile = {
            x: 0, y: 0, z: 0, 
            t: Math.round(report.createdAt.getTime() / 1000.0 / this.nuisanceMapSettings.timePeriod),
            nuisanceTypeId: report.nuisanceType.id,
            weight: report.intensity,
            count: 1
        };
        
        tile.fromPoint(nuisanceTile, report.location as Point, 16);
        
        return nuisanceTile;
    }

    /**
     * Increment the weight of the corresponding nuisance tile, according to the report data.
     * @param report 
     * @returns 
     */
    async onNewReport(report: Report): Promise<void> {
        let deltaNuisanceTile = this.convertReportToNuisanceTile(report);
        await this.nuisanceTiles.incrementNuisanceTile(deltaNuisanceTile);
    }

    /**
     * Decrement the weight of the corresponding nuisance tile, according to the report data.
     * @param report 
     * @returns 
     */
    async onDeletedReport(report: Report): Promise<void> {
        let deltaNuisanceTile = this.convertReportToNuisanceTile(report);
        await this.nuisanceTiles.decrementNuisanceTile(deltaNuisanceTile);   
    }

    async findNuisanceTilesBy(filter: FilterNuisanceTile, cursor?: Cursor): Promise<Array<NuisanceTile>> {
        return this.nuisanceTiles.findBy(filter, cursor || {page: 0, size: 20})
    }
    
    async countNuisanceTilesBy(filter: FilterNuisanceTile): Promise<number> {
        return this.nuisanceTiles.countBy(filter)
    }

    async getNuisanceTileImage(index: {x: number, y: number, z: number, t: number}, args: {mimeType?: string}): Promise<Buffer> {
        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        ctx.font = '30px Impact'
        ctx.rotate(0.1)
        ctx.fillText('Awesome!', 50, 100)
        //@ts-ignore
        return canvas.toBuffer(args.mimeType || "image/png");
    }
}