import { deleted_report, new_report } from "@/lib/signals";
import { generateNewReport, generateReport } from "../../src/lib/fixtures"
import { mockReceiver, newMockedNuisanceTypeRepository } from "../mock";
import { ReportingService } from "@/lib/services/reporting";
import { faker } from "@faker-js/faker";
import { Report } from "@/lib/model";
import { newMockedReportRepository } from "../mock";

describe("Reporting service", () => {
    
    afterEach(() => {
        new_report.clearAll();
        deleted_report.clearAll();
    })

    test("add report", async () => {
        // Mock dependencies
        const mockNewReportRecv = mockReceiver(new_report);
        const mockReportRepo = newMockedReportRepository();

        // Generate inputs and expected outputs
        const newReport = await generateNewReport({mockNuisanceTypeId: true});
        const expectedReport: Report = {id: faker.string.uuid(), createdAt: new Date(), ...newReport}

        // Mock dependencies calls
        mockReportRepo.insertReport.mockReturnValueOnce(Promise.resolve(expectedReport.id));
        mockReportRepo.getReport.mockReturnValueOnce(Promise.resolve(expectedReport));
        
        // Create the service
        const svc = new ReportingService({
            reports: mockReportRepo,
            nuisanceTypes: newMockedNuisanceTypeRepository()
        });
        
        // Call addReport
        const createdReport = await svc.addReport(newReport);

        // routine must send a new_report signal
        expect(mockNewReportRecv).toHaveBeenCalled();
        // routine must insert the report to the repository
        expect(mockReportRepo.insertReport).toHaveBeenCalled();
        // routine must retrieve the report from the repository
        expect(mockReportRepo.getReport).toHaveBeenCalled();
        // retrieved report must match the expected report
        expect(createdReport).toMatchObject(expectedReport);
    });

    test("remove report", async () => {
        // Generate inputs and expected outputs
        const existingReport = await generateReport({mockNuisanceTypeId: true});
        
        // Mock dependencies
        const mockDeletedReportRecv = mockReceiver(deleted_report);
        let mockReportRepo = newMockedReportRepository();
        // Mock dependencies calls
        mockReportRepo = {
            ...mockReportRepo,
            getReport: mockReportRepo.getReport.mockImplementation((id) => Promise.resolve(
                id === existingReport.id ? {...existingReport} : undefined
            )),
            deleteReport: mockReportRepo.deleteReport.mockImplementation((id) => Promise.resolve())
        };  

        // Create the service
        const svc = new ReportingService({
            reports: mockReportRepo,
            nuisanceTypes: newMockedNuisanceTypeRepository()
        });

        // Call removeReport
        const deletedReport = svc.removeReport(existingReport.id);

        // Should have retrieved the report stored in the repository.
        expect(mockReportRepo.getReport).toHaveBeenCalled();
        // Should have removed the report from the repository
        expect(mockReportRepo.deleteReport).toHaveBeenCalled();
        // Should have sent deleted_report signal
        expect(mockDeletedReportRecv).toHaveBeenCalled();
        // deleted report must match the expected report
        expect(deletedReport).toMatchObject(existingReport);

    })
})