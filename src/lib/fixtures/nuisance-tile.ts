//@ts-ignore
import { DeltaNuisanceTile, NuisanceTile, NuisanceTileRankWeights } from "@/lib/model";
import { randomInt } from "crypto";
import { INuisanceTileRepository, INuisanceTypeRepository } from "../repositories";
import { NuisanceTypeFixtures } from ".";
import { faker } from "@faker-js/faker";

export function randomTileCoordinates(): {x: number, y: number, z: number} {
    const z = randomInt(20)
    const x = randomInt(Math.pow(2, z))
    const y = randomInt(Math.pow(2, z))
    return {x, y, z}
}

export function randomRankWeights(): NuisanceTileRankWeights {
    return [
        randomInt(1, 10000),
        randomInt(1, 10000),
        randomInt(1, 10000),
        randomInt(1, 10000),
        randomInt(1, 10000)
    ]
}

export namespace NuisanceTileFixtures {
    export namespace ForRepositories {
        export async function generateDeltaNuisanceTileData(args?: Partial<DeltaNuisanceTile>, shared?: {repositories: {nuisanceTypes: INuisanceTypeRepository}}): Promise<DeltaNuisanceTile> {
            const tileIndex = randomTileCoordinates()
            const weights = randomRankWeights()
            const count = weights.reduce((a,b) => a + b, 0);
            
            return {
                x: args?.x || tileIndex.x, 
                y: args?.y || tileIndex.y, 
                z: args?.z || tileIndex.z, 
                t: args?.t || faker.date.anytime(),
                nuisanceTypeId: args?.nuisanceTypeId || (await NuisanceTypeFixtures.ForRepositories.insert({}, shared!)).id,
                count: args?.count || count,
                weights: args?.weights || weights,
                isFloor: args?.isFloor || false,
            }
        }
        
        export async function increment(args?: Partial<DeltaNuisanceTile>, shared?: {repositories: {nuisanceTypes: INuisanceTypeRepository, nuisanceTiles: INuisanceTileRepository}}): Promise<DeltaNuisanceTile> {
            const delta = await generateDeltaNuisanceTileData(args, shared);
            await shared?.repositories.nuisanceTiles.increment(delta);
            return delta
        }
    }
}
