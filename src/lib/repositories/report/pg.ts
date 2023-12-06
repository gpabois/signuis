import { Database, DatabaseConnection } from "@/lib/database";
import { FilterReport, InsertReport, PatchReport, Report, ReportSum } from "@/lib/model";
import { ExpressionOrFactory, SelectExpression, SelectQueryBuilder, sql } from "kysely";
import { IReportRepository, ReportSumByArgs } from "..";
import { Cursor } from "@/lib/utils/cursor";
import { Optional } from "@/lib/option";
import { ReportTable } from "@/lib/database/report";
import { ST_AsGeoJSON, ST_GeomFromGeoJSON, ST_Within } from "@/lib/utils/postgis";

export const PG_REPORT_TABLE_NAME = "Report";


/**
 * Postgres-implemented repository for reports.
 */
export class PgReportRepository implements IReportRepository {
    con: DatabaseConnection;

    constructor(con: DatabaseConnection) {
        this.con = con;
    }

    async insert(...inserts: Array<InsertReport>): Promise<Array<string>> {
        const result = await this.con
            .insertInto("Report")
            .values(inserts.map(insert =>({
                nuisanceTypeId: insert.nuisanceTypeId,
                userId:         insert.userId,
                location:       ST_GeomFromGeoJSON(insert.location),
                intensity:      insert.intensity,
                createdAt:      insert.createdAt
            })))
            .returning("id")
            .execute();

        return result.map(({id}) => id);
    }

    async update(update: PatchReport & { id: string; }): Promise<void> {
        const {id: id, ...values} = update;
        await this.con.updateTable(PG_REPORT_TABLE_NAME).set(update).where('id', '=', id)
    }
    
    async deleteBy(filter: FilterReport): Promise<void> {
        await this.con
            .deleteFrom(PG_REPORT_TABLE_NAME)
            .where(eb => eb.and(filter))
            .execute();
    }

    filter<SqlBool>(filter: FilterReport): ExpressionOrFactory<Database & {t0: ReportTable}, "t0", SqlBool>{
        const map = {
            id: "t0.id",
            userId: "t0.userId",
            intensity: "t0.intensity",
            createdAt: "t0.createdAt"
        }

        //@ts-ignore
        const direct = Object.fromEntries(Object.keys(filter).filter((k) => Object.keys(map).includes(k)).map(k => [map[k], filter[k]]))

        return eb => {
            let w: any = eb.and(direct)
                        
            if(filter.within && !Array.isArray(filter.within)) {
                w = eb.and([
                    w, 
                    sql<boolean>`ST_Contains(${ST_GeomFromGeoJSON(filter.within)}, t0.location)`
                ])
            } 

            if(filter.within && Array.isArray(filter.within)) {
                w = eb.and([
                    w, 
                    ...filter.within.map((within) => sql<boolean>`ST_Contains(${ST_GeomFromGeoJSON(within)}, t0.location)`)
                ])
            } 
            
            if(filter.id__in && filter.id__in.length > 0) {
                w = eb.and([
                    w, 
                    eb.or(filter.id__in.map((id) => eb('t0.id', '=', id)))
                ])
            }

            if(filter.between) {
                w = eb.and([w,
                    eb('t0.createdAt', '>=', filter.between.from),
                    eb('t0.createdAt', '<=', filter.between.to)
                ])
            }

            return w
        }
    }

    async sumBy(args: ReportSumByArgs): Promise<Array<ReportSum>> {
        let query = this.con
            .selectFrom("Report as t0")
            .select([
                sql<number>`COALESCE(CAST(SUM(CASE WHEN t0.intensity = 1 THEN 1 ELSE 0 END) AS INTEGER), 0)`.as('w1'),
                sql<number>`COALESCE(CAST(SUM(CASE WHEN t0.intensity = 2 THEN 1 ELSE 0 END) AS INTEGER), 0)`.as('w2'),
                sql<number>`COALESCE(CAST(SUM(CASE WHEN t0.intensity = 3 THEN 1 ELSE 0 END) AS INTEGER), 0)`.as('w3'),
                sql<number>`COALESCE(CAST(SUM(CASE WHEN t0.intensity = 4 THEN 1 ELSE 0 END) AS INTEGER), 0)`.as('w4'),
                sql<number>`COALESCE(CAST(SUM(CASE WHEN t0.intensity = 5 THEN 1 ELSE 0 END) AS INTEGER), 0)`.as('w5'),
                sql<number>`CAST(COUNT(*) as INTEGER)`.as('count')
            ])
            .$if(args.groupBy?.period !== undefined, (qb) => 
                qb
                .select(sql<Date>`DATE_BIN(
                    CONCAT(${args.groupBy?.period}::integer, ' milliseconds')::interval, 
                    t0."createdAt", 
                    ${args.filter.between?.from}::timestamp
                )`.as('period'))
                .groupBy(["period"])
            )
            .$if(args.groupBy?.nuisanceType !== undefined, (qb) =>
                qb.innerJoin("NuisanceType as t1", "t1.id", "t0.nuisanceTypeId")
                .select([
                    "t1.id as nuisanceType__id",
                    "t1.label as nuisanceType__label",
                    "t1.family as nuisanceType__family",
                    "t1.description as nuisanceType__description"
                ]).groupBy(["t1.id"])
            )
            .where(this.filter(args.filter))
            
        const rows = await query.execute()

        return rows.map(row => ({
            period: row.period,
            weights: [
                row.w1,
                row.w2,
                row.w3,
                row.w4,
                row.w5
            ],
            count: row.count,
            ...(row.nuisanceType__id && row.nuisanceType__label && row.nuisanceType__family && row.nuisanceType__description ? {
                nuisanceType: {
                    id: row.nuisanceType__id,
                    label: row.nuisanceType__label,
                    family: row.nuisanceType__family,
                    description: row.nuisanceType__description
                }
            }: {})
        }))
    }

    async findBy(filter: FilterReport, cursor: Cursor) {
        let query = this.con
            .selectFrom("Report as t0")
            .innerJoin("NuisanceType as t1", "t1.id", "t0.nuisanceTypeId")
            .leftJoin("User as t2", "t2.id", "t0.userId")
            .select([
                "t0.id as report__id", 
                "t0.userId as report__userId", 
                sql<number>`CAST(t0.intensity as INTEGER)`.as("report__intensity"), 
                "t0.createdAt as report__createdAt",
                sql<string>`ST_AsGeoJSON(t0.location)`.as('report__str_location'),
                
                "t1.id as nuisanceType__id",
                "t1.label as nuisanceType__label",
                "t1.family as nuisanceType__family",
                "t1.description as nuisanceType__description",
                
                "t2.id as user__id",
                "t2.name as user__name"
            ])
            //@ts-ignore
            .where(this.filter(filter))
            .orderBy("t0.createdAt desc")
        
        if(cursor.size > 0) {
            query = query
            .limit(cursor.size)
            .offset(cursor.size * cursor.page)
        }

        const items = await query.execute();
        
        return items.map((row) => ({
            id: row.report__id,
            createdAt: row.report__createdAt,
            intensity: row.report__intensity,
            location: JSON.parse(row.report__str_location),
            user: (row.user__id && row.user__name && {
                id: row.user__id,
                name: row.user__name
            }) || undefined, 
            nuisanceType: {
                id: row.nuisanceType__id,
                label: row.nuisanceType__label,
                family: row.nuisanceType__family,
                description: row.nuisanceType__description
            }
        }))
    }

    async findOneBy(filter: FilterReport): Promise<Optional<Report>> {
        const [item] = await this.findBy(filter, {page: 0, size:1});
        if(item === undefined) return null;
        return item
    }

    async countBy(filter: FilterReport): Promise<number> {
        const res = await this.con.selectFrom("Report as t0")
        .select(({fn}) => [fn.countAll<number>().as('count')])
        .where(this.filter(filter))
        .executeTakeFirstOrThrow();
        
        return res.count;
    }
};
