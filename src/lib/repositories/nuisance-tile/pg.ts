import { NuisanceTile, NuisanceTileIndex } from "@/lib/model";
import { DatabaseConnection } from "@/lib/database";
import { INuisanceTileRepository } from ".";

const PG_NUISANCE_TILE_TABLE_NAME = "NuisanceTile"

export class PgNuisanceTileRepository implements INuisanceTileRepository {
    con: DatabaseConnection

    constructor(con: DatabaseConnection) {
        this.con = con;
    }

    async incrementNuisanceTile(tile: NuisanceTile): Promise<void> {
        await this.con
            .insertInto(PG_NUISANCE_TILE_TABLE_NAME)
            .values(tile)
            .onConflict((oc) => oc
                .constraint('nuisance_tile_unique_index')
                .doUpdateSet(eb => ({
                    weight: eb('NuisanceTile.weight', '+', tile.weight),
                    count: eb('NuisanceTile.count', '+', 1)
                }))
            )
            .execute();
    }

    async decrementNuisanceTile(tile: NuisanceTile): Promise<void> {
        await this.con
            .updateTable(PG_NUISANCE_TILE_TABLE_NAME)
            .set((eb) => ({
                weight: eb('weight', '-', tile.weight),
                count: eb('count', '-', 1)
            }))
            .where((eb)=> eb.and({
                x: tile.x, 
                y: tile.y, 
                z: tile.z, 
                t: tile.t, 
                nuisanceTypeId: tile.nuisanceTypeId
            }))
            .execute();
    }

    async getNuisanceTile(tile: NuisanceTileIndex): Promise<NuisanceTile|undefined> {
        return await this.con
            .selectFrom(PG_NUISANCE_TILE_TABLE_NAME)
            .selectAll()
            .where((eb)=> eb.and({
                x: tile.x, 
                y: tile.y, 
                z: tile.z, 
                t: tile.t, 
                nuisanceTypeId: tile.nuisanceTypeId
            }))
            .executeTakeFirst();
    }
}