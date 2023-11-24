import {setupDatabase, teardownDatabase} from './index.setup';
import { getDatabaseConnection } from "@/lib/database"
import { NuisanceTypeFixtures } from '@/lib/fixtures';
import { INuisanceTypeRepository } from '@/lib/repositories';
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg"

describe("Test pg-based nuisance type repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    async function createRepository(): Promise<INuisanceTypeRepository> {
        return new PgNuisanceTypeRepository(await getDatabaseConnection());
    }

    test("insert(fixture)", async () => {
        // Setup
        const repo = await createRepository();
        const insertNuisanceType = NuisanceTypeFixtures.ForRepositories.generateInsertData();

        // Test
        const nuisanceTypeId = await repo.insert(insertNuisanceType); 
        expect(nuisanceTypeId).not.toBeNull();
    });

    test("findOneBy({id})", async () => {
        // Setup
        const repo = await createRepository();
        const {id, ...insert} = await NuisanceTypeFixtures.ForRepositories.insert({}, {repositories: {nuisanceTypes: repo}});

        // Test
        const nuisanceType = await repo.findOneBy({id});

        // Assertions
        expect(nuisanceType).not.toBeNull();
        expect(nuisanceType?.id).toEqual(id);
        expect(nuisanceType?.description).toBe(insert.description);
        expect(nuisanceType?.family).toBe(insert.family);
        expect(nuisanceType?.label).toBe(insert.label);
    })

    test("deleteNuisanceType", async () => {
        // Setup
        const repo = await createRepository();
        const {id} = await NuisanceTypeFixtures.ForRepositories.insert({}, {repositories: {nuisanceTypes: repo}});

        // Test
        await repo.deleteBy({id});
        
        // Assertions
        expect(await repo.findOneBy({id})).toBeNull();
    });
})