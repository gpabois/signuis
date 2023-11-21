import { setupDatabase, teardownDatabase } from "./index.setup";
import { PgNuisanceTileRepository, PgReportRepository } from '@/lib/repositories';
import { getDatabaseConnection } from '@/lib/database';
import { genNewNuisanceTileData } from "../../src/lib/fixtures";

describe("nuisance tile repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    test("incrementNuisanceTile", async() => {
        const repo = new PgNuisanceTileRepository(await getDatabaseConnection());
        const incTile = await genNewNuisanceTileData();
        await repo.incrementNuisanceTile(incTile);
    });

    test("getNuisanceTile", async() => {
        const repo = new PgNuisanceTileRepository(await getDatabaseConnection());
        const incTile = await genNewNuisanceTileData();
        await repo.incrementNuisanceTile(incTile);
        const tile = await repo.getNuisanceTile(incTile);

        expect(tile).toMatchObject(incTile);
    })

    test("decrementNuisanceTile", async() => {
        const repo = new PgNuisanceTileRepository(await getDatabaseConnection());
        const initialTile = await genNewNuisanceTileData({
            weight: 100,
            count: 10
        });

        await repo.incrementNuisanceTile(initialTile);

        const decTile = {...initialTile};
        decTile.count = 1;
        decTile.weight = 10;

        await repo.decrementNuisanceTile(decTile)!;
        const updatedTile = (await repo.getNuisanceTile(initialTile))!;

        expect(updatedTile.weight).toBe(90);
        expect(updatedTile.count).toBe(9);

    });
})