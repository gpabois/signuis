import { Point } from "geojson";
import { tile } from "../utils/slippyMap";
import { NuisanceTile, Report } from "../model";
import { Holder } from "../utils/holder";
import { INuisanceTileRepository } from "../repositories";
import { Signals } from "../signals";

export interface NuisanceMapSettings {
    /**
     * Time period in seconds for sampling.
     * @default 60
     */
    timePeriod: number

    /**
     * Floor zoom of the nuisance slippy map.
     * @default 16
     */
    floorZoom: number
}

export interface MonitoringService {

}

export interface MonitoringArgs {
    nuisanceMapSettings: NuisanceMapSettings,
    nuisanceTiles: INuisanceTileRepository,
    signals: Signals
}   

/**
 * Everything related to the monitoring of nuisances.
 */
export class MonitoringService implements MonitoringService {
    private nuisanceTiles: INuisanceTileRepository;
    private nuisanceMapSettings: NuisanceMapSettings;
    private signals: Signals

    constructor({nuisanceMapSettings, nuisanceTiles, signals}: MonitoringArgs) {
        this.nuisanceMapSettings = nuisanceMapSettings;
        this.nuisanceTiles = nuisanceTiles;
        this.signals = signals

        // Connect to some signals
        this.signals.report_created.connect((report: Report) => this.onNewReport(report));
        this.signals.report_deleted.connect((report: Report) => this.onDeletedReport(report));
    }

    /**
     * Convert a report into a nuisance tile.
     * @param report
     * @returns 
     */
    private convertReportToNuisanceTile(report: Report): NuisanceTile {
        let nuisanceTile: NuisanceTile = {
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
}