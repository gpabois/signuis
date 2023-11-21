import {setupDatabase, teardownDatabase} from './index.setup';
import { getDatabaseConnection } from "@/lib/database"
import { PgNuisanceTypeRepository } from "@/lib/repositories"
import { genNewNuisanceTypeData, genNewNuisanceTypeInRepository } from '../../src/lib/fixtures';

describe("nuisance type repository", () => {
    beforeAll(() => setupDatabase());
    afterAll(() => teardownDatabase());

    test("insertNuisanceType", async () => {
        const repo = new PgNuisanceTypeRepository(await getDatabaseConnection());
        const newNuisanceType = genNewNuisanceTypeData();
        const nuisanceTypeId = await repo.insertNuisanceType(newNuisanceType); 
        expect(nuisanceTypeId).not.toBeUndefined();
    });

    test("getNuisanceType", async () => {
        const repo = new PgNuisanceTypeRepository(await getDatabaseConnection());
        const nuisanceTypeId = await genNewNuisanceTypeInRepository({repo});
        const nuisanceType = await repo.getNuisanceType(nuisanceTypeId);
        expect(nuisanceType).not.toBeUndefined();
    })

    test("deleteNuisanceType", async () => {
        const repo = new PgNuisanceTypeRepository(await getDatabaseConnection());
        const newNuisanceType = genNewNuisanceTypeData();
        const nuisanceTypeId = (await repo.insertNuisanceType(newNuisanceType))!; 

        await repo.deleteNuisanceType(nuisanceTypeId);
        expect(await repo.getNuisanceType(nuisanceTypeId)).toBeUndefined();
    });
})