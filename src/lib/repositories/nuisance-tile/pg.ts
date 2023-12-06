import { NuisanceTileSum, FilterNuisanceTile, NuisanceTile, IntensityWeights } from "@/lib/model";
import { Database, DatabaseConnection } from "@/lib/database";
import { INuisanceTileRepository } from ".";
import { Cursor } from "@/lib/utils/cursor";
import { ExpressionOrFactory, sql } from "kysely";
import { Optional } from "@/lib/option";
import { NuisanceTileTable } from "@/lib/database/nuisance-tile";

const PG_NUISANCE_TILE_TABLE_NAME = "NuisanceTile"

type AggregatedRow = {
    nuisance_tile__x: number,
    nuisance_tile__y: number,
    nuisance_tile__z: number,

    nuisance_tile__t_from: Date,
    nuisance_tile__t_to: Date,

    nuisance_tile__w1: number,
    nuisance_tile__w2: number,
    nuisance_tile__w3: number,
    nuisance_tile__w4: number,
    nuisance_tile__w5: number,

    nuisance_tile__count: number,
    
    nuisance_types__id: Array<string>,
    nuisance_types__label: Array<string>,
    nuisance_types__family: Array<string>
    nuisance_types__description: Array<string>
}

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

    async sumBy(filter: FilterNuisanceTile): Promise<Array<NuisanceTileSum>> {       

        let query = this.con
        .selectFrom("NuisanceTile as t0")
        .innerJoin("NuisanceType as t1", "t1.id", "t0.nuisanceTypeId")
        .select([
            sql<number>`t0.x`.as("nuisance_tile__x"),
            sql<number>`t0.y`.as("nuisance_tile__y"),
            sql<number>`t0.z`.as("nuisance_tile__z"),
            
            sql<number>`CAST(COALESCE(SUM(t0.count), 0) AS INTEGER)`.as("nuisance_tile__count"),
            sql<number>`CAST(COALESCE(SUM(t0.w1), 0) AS INTEGER)`.as("nuisance_tile__w1"),
            sql<number>`CAST(COALESCE(SUM(t0.w2), 0) AS INTEGER)`.as("nuisance_tile__w2"),
            sql<number>`CAST(COALESCE(SUM(t0.w3), 0) AS INTEGER)`.as("nuisance_tile__w3"),
            sql<number>`CAST(COALESCE(SUM(t0.w4), 0) AS INTEGER)`.as("nuisance_tile__w4"),
            sql<number>`CAST(COALESCE(SUM(t0.w5), 0) AS INTEGER)`.as("nuisance_tile__w5"),

        ])
        .where(this.filter(filter))
        .groupBy(["t0.x", "t0.y", "t0.z"])

        const rows = await query.execute()
        
        return rows.map((row) => ({
            x: row.nuisance_tile__x,
            y: row.nuisance_tile__y,
            z: row.nuisance_tile__z,
            count: row.nuisance_tile__count,
            weights: [
                row.nuisance_tile__w1,
                row.nuisance_tile__w2,
                row.nuisance_tile__w3,
                row.nuisance_tile__w4,
                row.nuisance_tile__w5
            ]
        }))
    }

    async findBy(filter: FilterNuisanceTile, cursor: Cursor): Promise<Array<NuisanceTile>> {
        let query = this.con
            .selectFrom("NuisanceTile as t0")
            .innerJoin("NuisanceType as t1", "t1.id", "t0.nuisanceTypeId")
            .select([
                "t0.x as nuisance_tile__x",
                "t0.y as nuisance_tile__y",
                "t0.z as nuisance_tile__z",
                "t0.t as nuisance_tile__t",
                "t0.count as nuisance_tile__count",
                "t0.w1 as nuisance_tile__w1",
                "t0.w2 as nuisance_tile__w2",
                "t0.w3 as nuisance_tile__w3",
                "t0.w4 as nuisance_tile__w4",
                "t0.w5 as nuisance_tile__w5",
                "t1.id as nuisance_type__id",
                "t1.label as nuisance_type__label",
                "t1.family as nuisance_type__family",
                "t1.description as nuisance_type__description",
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

    async increment(weights: IntensityWeights, coordinates: Array<{x: number, y: number, z: number, t: Date, nuisanceTypeId: string}>): Promise<void> {
        await this.con
            .insertInto(PG_NUISANCE_TILE_TABLE_NAME)
            .values(coordinates.map((c) => ({
                ...c,
                count: weights.reduce((a,b) => a+b, 0), 
                w1: weights[0],
                w2: weights[1],
                w3: weights[2],
                w4: weights[3],
                w5: weights[4],
            })))
            .onConflict((oc) => oc
                .constraint('nuisance_tile_unique_index')
                .doUpdateSet(eb => ({
                    w1: eb('NuisanceTile.w1', '+', weights[0]),
                    w2: eb('NuisanceTile.w2', '+', weights[1]),
                    w3: eb('NuisanceTile.w3', '+', weights[2]),
                    w4: eb('NuisanceTile.w4', '+', weights[3]),
                    w5: eb('NuisanceTile.w5', '+', weights[4]),
                    count: eb('NuisanceTile.count', '+', weights.reduce((a,b) => a+b, 0))
                }))
            )
            .execute();
    }

    async decrement(weights: IntensityWeights, filter: FilterNuisanceTile): Promise<void> {
        await this.con
            .updateTable("NuisanceTile as t0")
            .set((eb) => ({
                w1: eb('t0.w1', '-', weights[0]),
                w2: eb('t0.w2', '-', weights[1]),
                w3: eb('t0.w3', '-', weights[2]),
                w4: eb('t0.w4', '-', weights[3]),
                w5: eb('t0.w5', '-', weights[4]),
                count: eb('t0.count', '-', weights.reduce((a,b) => a+b, 0))
            }))
            .where(this.filter(filter))
            .execute();
    }


    private filter<SqlBool>(filter: FilterNuisanceTile): ExpressionOrFactory<Database & {t0: NuisanceTileTable}, "t0", SqlBool> {
        const map = {
            x: "t0.x",
            y: "t0.y",
            z: "t0.z",
            t: "t0.t",
            nuisanceTypeId: "t0.nuisanceTypeId"
        }

        return eb => {
            //@ts-ignore
            const direct = Object.fromEntries(Object.keys(filter).filter((k) => Object.keys(map).includes(k)).map(k => [map[k], filter[k]]))
            let w: any = eb.and(direct)
            
            if(filter.between) {
                w = eb.and([
                    w,
                    eb('t0.t', '>=', filter.between.from),
                    eb('t0.t', '<=', filter.between.to)
                ])
            }
            
            if(filter.nuisanceTypeIds && filter.nuisanceTypeIds.length > 0) {
                w = eb.and([
                    w,
                    eb.or(filter.nuisanceTypeIds.map((id) => eb("t0.nuisanceTypeId", "=", id)))
                ])
            }

            if(filter.coordinates) {
                w = eb.and([w, eb.or((filter.coordinates.map((c) => eb.and({
                    ...c
                }))))])
            }

            return w
        }
    }

}