import { setupDatabase, teardownDatabase } from "./index.setup";
import { PgNuisanceTileRepository } from '@/lib/repositories/nuisance-tile/pg';
import { PgNuisanceTypeRepository } from "@/lib/repositories/nuisance-type/pg";

import { getDatabaseConnection } from '@/lib/database';
import { NuisanceTileFixtures, NuisanceTypeFixtures, randomTileCoordinates } from "../../src/lib/fixtures";
import { INuisanceTileRepository, INuisanceTypeRepository } from "@/lib/repositories";
import { faker } from "@faker-js/faker";
import { NuisanceTile } from "@/lib/model";

describe("nuisance tile repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    async function createRepository(): Promise<INuisanceTileRepository> {
        return new PgNuisanceTileRepository(await getDatabaseConnection());
    }

    async function createNuisanceTypeRepository(): Promise<INuisanceTypeRepository> {
        return new PgNuisanceTypeRepository(await getDatabaseConnection());
    }

    async function setup(): Promise<{repositories: {nuisanceTypes: INuisanceTypeRepository, nuisanceTiles: INuisanceTileRepository}}> {
        return {
            repositories: {
                nuisanceTypes: await createNuisanceTypeRepository(), 
                nuisanceTiles: await createRepository()
            }
        }
    }

    test("aggregateBy", async () => {
        // Setup
        const shared = await setup();

        
        const from = new Date("2020-01-01T00:00:00.000Z")
        const to = new Date("2023-01-01T00:00:00.000Z")
        
        const ts = [faker.date.between({from, to}), faker.date.between({from, to}), faker.date.between({from, to})]

        const idx = randomTileCoordinates();

        // First tile 
        const {nuisanceTypeId} =  await NuisanceTileFixtures.ForRepositories.increment(
            {...idx, t: ts.pop(), weights: NuisanceTile.intoWeights(5)}, 
            shared
        );
        // Second tile
        await NuisanceTileFixtures.ForRepositories.increment(
            {...idx, t: ts.pop(), nuisanceTypeId, weights: NuisanceTile.intoWeights(5)}, 
            shared
        );
        // Third tile, but different nuisance type
        await NuisanceTileFixtures.ForRepositories.increment(
            {...idx, t: ts.pop(), nuisanceTypeId, weights: NuisanceTile.intoWeights(5)}, 
            shared
        );

        const aggTile = await shared.repositories.nuisanceTiles.aggregateBy({
            x: idx.x, y: idx.y, z: idx.z, 
            nuisanceTypeId,
            between: {from, to}
        }, ["Time", "NuisanceType"])

        console.log(aggTile)
        expect(true).toBe(false)
    })

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