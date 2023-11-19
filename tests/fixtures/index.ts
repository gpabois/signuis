//@ts-ignore
import * as turf from '@turf/turf';
import { NewNuisanceType, NewReport, NuisanceTile, NuisanceType, Report } from "@/lib/model";
import { randomInt } from "crypto";
import { INuisanceTypeRepository, IReportRepository, PgNuisanceTypeRepository, PgReportRepository } from '@/lib/repositories';
import { getDatabaseConnection } from '@/lib/database';
import { faker } from '@faker-js/faker';

export async function genNewNuisanceTileData(args?: Partial<NuisanceTile>): Promise<NuisanceTile> {
    return {
        x: 0, y: 0, z: 0, t: 0,
        nuisanceTypeId: await genNewNuisanceTypeInRepository(),
        count:      randomInt(10),
        weight:     randomInt(100),
        ...args
    }
}


export function genNewNuisanceTypeData(): NewNuisanceType {
    return {
        label: faker.string.symbol(10),
        family: faker.string.symbol(10),
        description: faker.lorem.word(40)
    }
}

/**
 * Generate a mocked nuisance type
 */
export function genNuisanceTypeData(): NuisanceType {
    return {
        id: faker.string.uuid(),
        label: faker.string.symbol(10),
        family: faker.string.symbol(10),
        description: faker.lorem.word(40)
    }
}

/**
 * Generate a new nuisance type in the repository
 * @param args 
 * @returns 
 */
export async function genNewNuisanceTypeInRepository(args?: Partial<NewNuisanceType> & {repo?: INuisanceTypeRepository}): Promise<string> {
    const repo = args?.repo || new PgNuisanceTypeRepository(await getDatabaseConnection());
    const newNuisanceType = genNewNuisanceTypeData();
    return await repo.insertNuisanceType(newNuisanceType); 
}


export async function generateNewReport(args?: Partial<NewReport> & {mockNuisanceTypeId?: boolean, nuisanceTypeRepo?: INuisanceTypeRepository}): Promise<NewReport> {
    return {
        location:       turf.randomPoint().features[0].geometry,
        nuisanceTypeId: args?.mockNuisanceTypeId ? faker.string.uuid() : await genNewNuisanceTypeInRepository({repo: args?.nuisanceTypeRepo}),
        intensity:      randomInt(10),
    }
}

export async function generateReport(args?: Partial<Report> & {mockNuisanceTypeId?: boolean, nuisanceTypeRepo?: INuisanceTypeRepository}): Promise<Report> {
    return {
        id:             args?.id || faker.string.uuid(),
        createdAt:      args?.createdAt || faker.date.anytime(),
        location:       args?.location || turf.randomPoint().features[0].geometry,
        nuisanceTypeId: args?.mockNuisanceTypeId ? faker.string.uuid() : await genNewNuisanceTypeInRepository({repo: args?.nuisanceTypeRepo}),
        intensity:      args?.intensity || randomInt(10),
    }
}

/**
 * Add a new report stored in the repository.
 * @returns 
 */
export async function addNewReportInRepository(): Promise<Report["id"]> {
    const repo = new PgReportRepository(await getDatabaseConnection());
    const newReport = await generateNewReport();
    return await repo.insertReport(newReport);
}