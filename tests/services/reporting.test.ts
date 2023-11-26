import { Signals, createSignals} from "@/lib/signals";
import { NuisanceTypeFixtures, ReportFixtures } from "../../src/lib/fixtures"
import { MockNuisanceTypeRepository, MockReportRepository, newMockedNuisanceTypeRepository } from "../mock";
import { IReportingService, ReportingService } from "@/lib/services/reporting";
import { newMockedReportRepository } from "../mock";

describe("Reporting service", () => {
    
    function setup(): {signals: Signals, services: {reporting: IReportingService}, repositories: {reports: MockReportRepository, nuisanceTypes: MockNuisanceTypeRepository}} {
        const signals = createSignals();
        const reports = newMockedReportRepository();
        const nuisanceTypes = newMockedNuisanceTypeRepository();
        return {
            signals,
            services: {
                reporting: new ReportingService({reports, signals, nuisanceTypes})
            },
            repositories: {
                reports, 
                nuisanceTypes
            }
        }   
    }

    test("createReport", async () => {
        // Setup
        const {signals, services: {reporting}, repositories: {reports, nuisanceTypes}} = setup();

        const nuisanceType = NuisanceTypeFixtures.ForServices.generateNuisanceTypeData();
        const createReport = await ReportFixtures.ForServices.generateCreateReportData({nuisanceTypeId: nuisanceType.id});
        const findByReport = await ReportFixtures.ForRepositories.generateFindByReportData({
            location: createReport.location, 
            intensity: createReport.intensity,
            nuisanceType
        })

        reports.insert.mockReturnValueOnce(Promise.resolve(findByReport.id))
        reports.findOneBy.mockReturnValue(Promise.resolve(findByReport))

        const report = await reporting.createReport(createReport);
        expect(report.id).toBe(findByReport.id);
        expect(report.nuisanceType).toMatchObject(findByReport.nuisanceType)
        expect(report.location).toMatchObject(findByReport.location)
        expect(report.intensity).toBe(findByReport.intensity)
    })

    test("deleteReportBy({id})", async () => {
        // Setup
        const {signals, services: {reporting}, repositories: {reports, nuisanceTypes}} = setup();

        const report = ReportFixtures.ForServices.generateReportData({})

        reports.findBy.mockImplementationOnce(async ({id}) => {
            return id == report.id ? [report] : []
        })
        reports.deleteBy.mockImplementationOnce(async (filter) => {
            expect(filter.id).toBe(report.id)
            return;
        })


        await reporting.deleteReportBy({id: report.id});
    })
})