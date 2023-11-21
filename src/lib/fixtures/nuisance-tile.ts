//@ts-ignore
import { NuisanceTile } from "@/lib/model";
import { randomInt } from "crypto";
import { Shared } from '@/lib/shared';


export async function generateNuisanceTileData(args?: Partial<NuisanceTile>, shared?: Shared): Promise<NuisanceTile> {
    return {
        x: args?.x || 0, y: args?.y || 0, z: args?.z || 0, t: args?.t || 0,
        nuisanceTypeId: args?.nuisanceTypeId || await generateNuisanceType({}, shared!),
        count:      args?.count || randomInt(10),
        weight:     args?.weight || randomInt(100),
    }
}
