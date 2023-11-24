import { setupDatabase, teardownDatabase } from "./index.setup";
import { PgNuisanceTileRepository } from '@/lib/repositories/nuisance-tile/pg';
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg";

import { getDatabaseConnection } from '@/lib/database';
import { NuisanceTileFixtures } from "../../src/lib/fixtures";
import { INuisanceTileRepository, INuisanceTypeRepository } from "@/lib/repositories";

describe("nuisance tile repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    async function createRepository(): Promise<INuisanceTileRepository> {
        return new PgNuisanceTileRepository(await getDatabaseConnection());
    }

    async function createNuisanceTypeRepository(): Promise<INuisanceTypeRepository> {
        return new PgNuisanceTypeRepository(await getDatabaseConnection());
    }

    test("increment(delta)", async() => {
        // Setup
        const repo = await createRepository();
        const delta = await NuisanceTileFixtures.ForRepositories.generateDeltaNuisanceTileData({}, {repositories: {nuisanceTypes: await createNuisanceTypeRepository()}})
        
        // Test
        await repo.increment(delta);
    });

    test("decrement(delta)", async() => {
        // Setup
        const repo = await createRepository();
        const delta = await NuisanceTileFixtures.ForRepositories.increment({}, {repositories: {nuisanceTypes: await createNuisanceTypeRepository(), nuisanceTiles: repo}})
    
        // Test
        await repo.decrement(delta);
        const tile = await repo.findOneBy(delta);
        
        expect(tile?.count).toBe(0);
    });

    test("findOneBy", async() => {
        // Setup
        const repo = await createRepository();
        
        const delta = await NuisanceTileFixtures.ForRepositories.increment({}, {repositories: {nuisanceTypes: await createNuisanceTypeRepository(), nuisanceTiles: repo}})
        const tile = await repo.findOneBy(delta);
        
        // Assertions
        expect(tile).not.toBeNull();
        expect(tile!.x).toEqual(delta.x);
        expect(tile!.y).toEqual(delta.y);
        expect(tile!.z).toEqual(delta.z);
        expect(tile!.t).toEqual(delta.t);
        expect(tile!.nuisanceType.id).toEqual(delta.nuisanceTypeId);
    })
})