import { PgReportRepository } from "@/lib/repositories/report/pg";
import { setupDatabase, teardownDatabase } from "./index.setup";
import { getDatabaseConnection } from '@/lib/database';
import { INuisanceTypeRepository, IReportRepository } from "@/lib/repositories";
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg";
import { ReportFixtures } from "@/lib/fixtures";

describe("report repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    async function createRepository(): Promise<IReportRepository> {
        return new PgReportRepository(await getDatabaseConnection());
    }

    async function createNuisanceTypeRepository(): Promise<INuisanceTypeRepository> {
        return new PgNuisanceTypeRepository(await getDatabaseConnection());
    }

    test("insert", async() => {
        // Setup
        const repo = await createRepository()
        const insertReport = await ReportFixtures.ForRepositories.generateInsertReportData({}, {repositories: {nuisanceTypes: await createNuisanceTypeRepository()}});
        
        // Test
        const id = await repo.insert(insertReport);
        expect(id).not.toBeNull();
    });

    test("findOneBy({id})", async() => {
        // Setup
        const repo = await createRepository()
        const {id, ...insert} = await ReportFixtures.ForRepositories.insert({}, {repositories: {nuisanceTypes: await createNuisanceTypeRepository(), reports: repo}});

        // Test
        const report = await repo.findOneBy({id})
        // Assertions
        expect(report).not.toBeNull();
        expect(report!.id).toBe(id);
        expect(report!.location.coordinates[0]).toBeCloseTo(insert.location.coordinates[0]);
        expect(report!.location.coordinates[1]).toBeCloseTo(insert.location.coordinates[1]);
        expect(report!.nuisanceType.id).toBe(insert.nuisanceTypeId);
        expect(report!.intensity).toBe(insert.intensity);
    });

    test("deleteBy", async() => {
        const repo = new PgReportRepository(await getDatabaseConnection());
        const {id} = await ReportFixtures.ForRepositories.insert({}, {repositories: {nuisanceTypes: await createNuisanceTypeRepository(), reports: repo}});

        // Test
        await repo.deleteBy({id});
        // Assertions
        expect(await repo.findOneBy({id})).toBeNull();
    })
    
})