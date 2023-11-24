import { Cursor } from "../utils/cursor";
import { Report, CreateReport, CreateNuisanceType, NuisanceType, FilterReport, FilterNuisanceType, PatchReport } from "../model";
import { INuisanceTypeRepository, IReportRepository } from "../repositories";
import { Signals } from "../signals";
import { Optional } from "../option";

export interface IReportingService {
    /**
     * Add a new entry.
     * @param report 
     * @return Created report
     */
    createReport(newReport: CreateReport): Promise<Report>;

    /**
     * Remove an entry by its id
     * @return Deleted report
     */
    deleteReportBy(filter: FilterReport): Promise<void>;

    /**
     * Find one report by a filter
     * @param filter 
     */
    findReportBy(filter: FilterReport): Promise<Optional<Report>>
    /**
     * Get a page of entries
     * @param userId 
     * @param cursor 
     */
    findReportsBy(filter: FilterReport, cursor?: Cursor): Promise<Report[]>;

    /**
     * Return the number of entries
     * @param filter 
     */
    countReportsBy(filter: Partial<Report>): Promise<number>;

    /**
     * Add a new nuisance type
     * @param newNuisanceType 
     */
    createNuisanceType(newNuisanceType: CreateNuisanceType): Promise<NuisanceType>;

    /**
     * Add a new nuisance type
     * @param nuisanceTypeId 
     */
    removeNuisanceType(nuisanceTypeId: NuisanceType["id"]): Promise<NuisanceType|undefined>;

    /**
     * Get a page of nuisance types
     * @param filter 
     * @param cursor 
     */
    findNuisanceTypesBy(filter: Partial<NuisanceType>, cursor?: Cursor): Promise<NuisanceType[]>;

    /**
     * Count the number of nuisance types
     * @param filter 
     */
    countNuisanceTypesBy(filter: Partial<NuisanceType>): Promise<number>;
}

export type ReportingServiceArgs = {
    reports: IReportRepository, 
    nuisanceTypes: INuisanceTypeRepository, 
    signals: Signals
};

export class ReportingService implements IReportingService {
    private reports: IReportRepository
    private nuisanceTypes: INuisanceTypeRepository
    private signals: Signals

    constructor({reports, nuisanceTypes, signals}: ReportingServiceArgs) {
        this.reports = reports;
        this.nuisanceTypes = nuisanceTypes;
        this.signals = signals;
    }


    async createReport(newReport: CreateReport): Promise<Report> {
        // Insert a new report
        const id = await this.reports.insert(newReport);
        
        // Retrieve the new inserted report
        const report = (await this.reports.findOneBy({id}))!;
        
        // Send the signal across the application.
        await this.signals.report_created.send(this, report);

        return report;
    }


    async deleteReportBy(filter: FilterReport): Promise<void> {
        const reports = await this.reports.findBy(filter, {page: 0, size: -1});
        await this.reports.deleteBy(filter);
        await Promise.all(reports.map((report) => this.signals.report_deleted.send(this, report)));
    }
    
    findReportBy(filter: Partial<PatchReport>): Promise<Optional<Report>> {
       return this.reports.findOneBy(filter)
    }

    findReportsBy(filter: FilterReport, cursor?: Cursor): Promise<Report[]> {
        cursor = cursor || {page: 0, size: 20};
        return this.reports.findBy(filter, cursor)
    }

    countReportsBy(filter: FilterReport): Promise<number> {
        return this.reports.countBy(filter);
    }

    async createNuisanceType(newNuisanceType: CreateNuisanceType): Promise<NuisanceType> {
        const id = await this.nuisanceTypes.insert(newNuisanceType);
        return (await this.nuisanceTypes.findOneBy({id}))!;
    }
    
    async removeNuisanceType(id: string): Promise<NuisanceType|undefined> {
        const nuisanceType = await this.nuisanceTypes.findOneBy({id});

        if(nuisanceType === null) return;
        
        await this.nuisanceTypes.deleteBy({id: nuisanceType.id});

        return nuisanceType;
    }

    async findNuisanceTypesBy(filter: FilterNuisanceType, cursor?: Cursor): Promise<NuisanceType[]> {
        cursor = cursor || {page: 0, size: 20};
        return await this.nuisanceTypes.findBy(filter, cursor);
    }

    countNuisanceTypesBy(filter: FilterNuisanceType): Promise<number> {
        return this.nuisanceTypes.countBy(filter);
    }
}