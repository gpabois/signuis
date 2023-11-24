import { DeltaNuisanceTile, FilterNuisanceTile, NuisanceTile, NuisanceTileIndex } from "@/lib/model";
import { Database, DatabaseConnection } from "@/lib/database";
import { INuisanceTileRepository } from ".";
import { Cursor } from "@/lib/utils/cursor";
import { ExpressionOrFactory, sql } from "kysely";
import { tile } from "@/lib/utils/slippyMap";
import { Optional } from "@/lib/option";

const PG_NUISANCE_TILE_TABLE_NAME = "NuisanceTile"

export class PgNuisanceTileRepository implements INuisanceTileRepository {
    con: DatabaseConnection

    constructor(con: DatabaseConnection) {
        this.con = con;
    }

    async countBy(filter: FilterNuisanceTile): Promise<number> {
        const res = await this.con.selectFrom("NuisanceTile")
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(eb => {
            let w = eb.and(filter);
            return w            
        })
        .executeTakeFirstOrThrow();
        
        return res.count;
    }

    async findOneBy(filter: FilterNuisanceTile): Promise<Optional<NuisanceTile>> {
        const [item] = await this.findBy(filter, {page: 0, size: 1})
        if(item === undefined) return null;
        return item
    }

    private filter(filter: FilterNuisanceTile): ExpressionOrFactory<Database, "NuisanceTile", false> {
        const map = {
            x: "NuisanceTile.x",
            y: "NuisanceTile.y",
            z: "NuisanceTile.z",
            t: "NuisanceTile.t"
        }

        return eb => {
            //@ts-ignore
            const direct = Object.fromEntries(Object.keys(filter).filter((k) => Object.keys(map).includes(k)).map(k => [map[k], filter[k]]))
            let w: any = eb.and(direct)
            return w
        }
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
                "NuisanceTile.w1 as nuisance_tile__w1",
                "NuisanceTile.w2 as nuisance_tile__w2",
                "NuisanceTile.w3 as nuisance_tile__w3",
                "NuisanceTile.w4 as nuisance_tile__w4",
                "NuisanceTile.w5 as nuisance_tile__w5",
                "NuisanceType.id as nuisance_type__id",
                "NuisanceType.label as nuisance_type__label",
                "NuisanceType.family as nuisance_type__family",
                "NuisanceType.description as nuisance_type__description",
            ])
            .where(this.filter(filter));

        if(cursor.size > 0) {
            query = query.limit(cursor.size).offset(cursor.size * cursor.page)
        }

        return (await query.execute()).map((row) => ({
            x: row.nuisance_tile__x,
            y: row.nuisance_tile__y,
            z: row.nuisance_tile__z,
            t: row.nuisance_tile__t,
            count: row.nuisance_tile__count,
            weights: [
                row.nuisance_tile__w1,
                row.nuisance_tile__w2,
                row.nuisance_tile__w3,
                row.nuisance_tile__w4,
                row.nuisance_tile__w5
            ],
            nuisanceType: {
                id: row.nuisance_type__id,
                label: row.nuisance_type__label,
                family: row.nuisance_type__family,
                description: row.nuisance_type__description
            }
        }))
    }

    async increment(tile: DeltaNuisanceTile): Promise<void> {
        await this.con
            .insertInto(PG_NUISANCE_TILE_TABLE_NAME)
            .values({
                x: tile.x,
                y: tile.y,
                z: tile.z,
                t: tile.t,
                nuisanceTypeId: tile.nuisanceTypeId,
                count: tile.count, 
                w1: tile.weights[0],
                w2: tile.weights[1],
                w3: tile.weights[2],
                w4: tile.weights[3],
                w5: tile.weights[4],
            })
            .onConflict((oc) => oc
                .constraint('nuisance_tile_unique_index')
                .doUpdateSet(eb => ({
                    w1: eb('NuisanceTile.w1', '+', tile.weights[0]),
                    w2: eb('NuisanceTile.w2', '+', tile.weights[1]),
                    w3: eb('NuisanceTile.w3', '+', tile.weights[2]),
                    w4: eb('NuisanceTile.w4', '+', tile.weights[3]),
                    w5: eb('NuisanceTile.w5', '+', tile.weights[4]),
                    count: eb('NuisanceTile.count', '+', tile.count)
                }))
            )
            .execute();
    }

    async decrement(dt: DeltaNuisanceTile): Promise<void> {
        await this.con
            .updateTable(PG_NUISANCE_TILE_TABLE_NAME)
            .set((eb) => ({
                w1: eb('NuisanceTile.w1', '-', dt.weights[0]),
                w2: eb('NuisanceTile.w2', '-', dt.weights[1]),
                w3: eb('NuisanceTile.w3', '-', dt.weights[2]),
                w4: eb('NuisanceTile.w4', '-', dt.weights[3]),
                w5: eb('NuisanceTile.w5', '-', dt.weights[4]),
                count: eb('NuisanceTile.count', '-', dt.count)
            }))
            .where((eb)=> eb.and({
                x: dt.x, 
                y: dt.y, 
                z: dt.z, 
                t: dt.t, 
                nuisanceTypeId: dt.nuisanceTypeId
            }))
            .execute();
    }
}