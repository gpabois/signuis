import { DeltaNuisanceTile, FilterNuisanceTile, NuisanceTile, NuisanceTileIndex } from "@/lib/model";
import { DatabaseConnection } from "@/lib/database";
import { INuisanceTileRepository } from ".";
import { Cursor } from "@/lib/utils/cursor";
import { sql } from "kysely";

const PG_NUISANCE_TILE_TABLE_NAME = "NuisanceTile"

export class PgNuisanceTileRepository implements INuisanceTileRepository {
    con: DatabaseConnection

    constructor(con: DatabaseConnection) {
        this.con = con;
    }

    async countBy(filter: Partial<NuisanceTile>): Promise<number> {
        const res = await this.con.selectFrom("NuisanceTile")
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(eb => eb.and(filter))
        .executeTakeFirstOrThrow();
        
        return res.count;
    }

    async findBy(filter: FilterNuisanceTile, cursor: Cursor): Promise<Array<NuisanceTile>> {
        let query = this.con
            .selectFrom("NuisanceTile")
            .innerJoin("NuisanceType", "NuisanceType.id", "NuisanceTile.nuisanceTypeId")
            .select([
                "NuisanceTile.x as nuisance_tile__x",
                "NuisanceTile.y as nuisance_tile__y",
                "NuisanceTile.z as nuisance_tile__z",
                "NuisanceTile.t as nuisance_tile__t",
                "NuisanceTile.count as nuisance_tile__count",
                "NuisanceTile.weight as nuisance_tile__weight",
                "NuisanceType.id as nuisance_type__id",
                "NuisanceType.label as nuisance_type__label",
                "NuisanceType.family as nuisance_type__family",
                "NuisanceType.description as nuisance_type__description",
            ])
            .where(eb => eb.and(filter));

        if(cursor.size > 0) {
            query = query.limit(cursor.size).offset(cursor.size * cursor.page)
        }

        return (await query.execute()).map((row) => ({
            x: row.nuisance_tile__x,
            y: row.nuisance_tile__y,
            z: row.nuisance_tile__z,
            t: row.nuisance_tile__t,
            count: row.nuisance_tile__count,
            weight: row.nuisance_tile__weight,
            nuisanceType: {
                id: row.nuisance_type__id,
                label: row.nuisance_type__label,
                family: row.nuisance_type__family,
                description: row.nuisance_type__description
            }
        }))
    }

    async incrementNuisanceTile(tile: DeltaNuisanceTile): Promise<void> {
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

    async decrementNuisanceTile(tile: DeltaNuisanceTile): Promise<void> {
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
}