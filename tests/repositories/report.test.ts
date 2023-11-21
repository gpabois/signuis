import { setupDatabase, teardownDatabase } from "./index.setup";
import { PgReportRepository } from '@/lib/repositories';
import { getDatabaseConnection } from '@/lib/database';
import { addNewReportInRepository, generateNewReport } from "../../src/lib/fixtures";


describe("report repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    test("insertReport", async() => {
        const repo = new PgReportRepository(await getDatabaseConnection());
        const newReport = await generateNewReport();
        const reportId = await repo.insertReport(newReport);
        expect(reportId).not.toBeUndefined();
    });

    test("getReport", async() => {
        const repo = new PgReportRepository(await getDatabaseConnection());
        const newReport = await generateNewReport();
        const reportId = await repo.insertReport(newReport);
        
        const report = (await repo.getReport(reportId))!;
        expect(report.id).toBe(reportId);
        expect(report.location.coordinates[0]).toBeCloseTo(newReport.location.coordinates[0]);
        expect(report.location.coordinates[1]).toBeCloseTo(newReport.location.coordinates[1]);
    });

    test("deleteReport", async() => {
        const repo = new PgReportRepository(await getDatabaseConnection());
        const reportId = await addNewReportInRepository();
        await repo.deleteReport(reportId);
        expect(await repo.getReport(reportId)).toBeUndefined();
    })
    
})